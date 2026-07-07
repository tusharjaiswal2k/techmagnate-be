import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bullmq';
import { Model } from 'mongoose';
import { chunkArray } from '../common/utils/chunk-array';
import { validateTaskFields } from '../common/validators/task-fields.validator';
import { CsvRowDto } from './dto/csv-row.dto';
import { BulkUpload, BulkUploadDocument } from './schemas/bulk-upload.schema';
import {
  DATAFORSEO_BATCH_QUEUE,
  MAX_TASKS_PER_BATCH,
  PROCESS_BATCH_JOB,
} from './queue/queue.constants';

export interface BatchJobData {
  bulkUploadId: string;
  batchIndex: number;
  created_by: string;
  specs: {
    keyword: string;
    language_code: string;
    location_code: number;
    priority: number;
  }[];
}

@Injectable()
export class BulkUploadService {
  constructor(
    @InjectModel(BulkUpload.name)
    private readonly bulkUploadModel: Model<BulkUploadDocument>,
    @InjectQueue(DATAFORSEO_BATCH_QUEUE)
    private readonly queue: Queue<BatchJobData>,
    private readonly configService: ConfigService,
  ) {}

  async submit(
    rows: CsvRowDto[],
    originalFilename?: string,
  ): Promise<{ bulkUploadId: string; totalBatches: number; status: string }> {
    const validated = rows.map((row) => validateTaskFields(row));
    const invalid = validated.filter((v) => !v.valid);
    if (invalid.length > 0) {
      throw new BadRequestException({
        message: 'One or more rows failed server-side validation',
        reasons: invalid.map((v) => v.reasons).flat(),
      });
    }

    const createdBy =
      this.configService.get<string>('DEFAULT_CREATED_BY') ?? 'system';

    const specs = validated.map((v) => ({
      keyword: v.normalized!.keyword,
      language_code: v.normalized!.language_code,
      location_code: v.normalized!.location_code,
      priority: v.normalized!.priority,
    }));

    const batches = chunkArray(specs, MAX_TASKS_PER_BATCH);

    const bulkUpload = await this.bulkUploadModel.create({
      originalFilename: originalFilename ?? 'upload.csv',
      totalRows: rows.length,
      validRowCount: rows.length,
      invalidRowCount: 0,
      created_by: createdBy,
      status: 'queued',
      totalBatches: batches.length,
      completedBatches: 0,
      failedBatches: 0,
      batches: batches.map((batch, index) => ({
        batchIndex: index,
        jobId: '',
        taskCount: batch.length,
        status: 'queued',
      })),
      totalCost: 0,
    });

    const bulkUploadId = bulkUpload._id.toString();

    for (let index = 0; index < batches.length; index++) {
      const job = await this.queue.add(
        PROCESS_BATCH_JOB,
        {
          bulkUploadId,
          batchIndex: index,
          created_by: createdBy,
          specs: batches[index],
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      bulkUpload.batches[index].jobId = job.id ?? '';
    }
    await bulkUpload.save();

    return { bulkUploadId, totalBatches: batches.length, status: 'queued' };
  }

  async getStatus(id: string): Promise<BulkUploadDocument> {
    const doc = await this.bulkUploadModel
      .findById(id)
      .lean<BulkUploadDocument>();
    if (!doc) throw new NotFoundException(`BulkUpload ${id} not found`);
    return doc;
  }

  async markBatchProcessing(bulkUploadId: string, batchIndex: number) {
    await this.bulkUploadModel.updateOne(
      { _id: bulkUploadId, 'batches.batchIndex': batchIndex },
      {
        $set: {
          status: 'processing',
          'batches.$.status': 'processing',
        },
      },
    );
  }

  async markBatchCompleted(
    bulkUploadId: string,
    batchIndex: number,
    result: { succeededCount: number; failedCount: number; cost: number },
  ) {
    await this.bulkUploadModel.updateOne(
      { _id: bulkUploadId, 'batches.batchIndex': batchIndex },
      {
        $set: {
          'batches.$.status': 'completed',
          'batches.$.succeededCount': result.succeededCount,
          'batches.$.failedCount': result.failedCount,
          'batches.$.cost': result.cost,
          'batches.$.processedAt': new Date(),
        },
        $inc: { completedBatches: 1, totalCost: result.cost },
      },
    );
    await this.finalizeIfDone(bulkUploadId);
  }

  async markBatchFailed(
    bulkUploadId: string,
    batchIndex: number,
    error: string,
  ) {
    await this.bulkUploadModel.updateOne(
      { _id: bulkUploadId, 'batches.batchIndex': batchIndex },
      {
        $set: {
          'batches.$.status': 'failed',
          'batches.$.error': error,
          'batches.$.processedAt': new Date(),
        },
        $inc: { failedBatches: 1 },
      },
    );
    await this.finalizeIfDone(bulkUploadId);
  }

  private async finalizeIfDone(bulkUploadId: string) {
    const doc = await this.bulkUploadModel.findById(bulkUploadId);
    if (!doc) return;
    const settled = doc.completedBatches + doc.failedBatches;
    if (settled < doc.totalBatches) return;

    let finalStatus: BulkUploadDocument['status'];
    if (doc.failedBatches === 0) finalStatus = 'completed';
    else if (doc.completedBatches === 0) finalStatus = 'failed';
    else finalStatus = 'completed_with_errors';

    doc.status = finalStatus;
    await doc.save();
  }
}
