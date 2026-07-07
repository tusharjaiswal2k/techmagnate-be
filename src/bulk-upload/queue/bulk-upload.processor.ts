import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bullmq';
import { Model } from 'mongoose';
import { DataForSeoService } from '../../dataforseo/dataforseo.service';
import { Task, TaskDocument } from '../../tasks/schemas/task.schema';
import { BatchJobData, BulkUploadService } from '../bulk-upload.service';
import { DATAFORSEO_BATCH_QUEUE } from './queue.constants';

const SUCCESS_STATUS_THRESHOLD = 40000;

@Processor(DATAFORSEO_BATCH_QUEUE, {
  concurrency: Number(process.env.BULLMQ_CONCURRENCY ?? 3),
})
export class BulkUploadProcessor extends WorkerHost {
  private readonly logger = new Logger(BulkUploadProcessor.name);

  constructor(
    private readonly dataForSeoService: DataForSeoService,
    private readonly bulkUploadService: BulkUploadService,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
  ) {
    super();
  }

  async process(job: Job<BatchJobData>): Promise<void> {
    const { bulkUploadId, batchIndex, specs, created_by } = job.data;
    await this.bulkUploadService.markBatchProcessing(bulkUploadId, batchIndex);

    try {
      const results = await this.dataForSeoService.postSerpTasksLive(specs);

      await this.taskModel.insertMany(
        results.map((r) => ({
          ...r,
          source: 'bulk',
          bulkUploadId,
          created_by,
        })),
      );

      const succeededCount = results.filter(
        (r) => r.status_code < SUCCESS_STATUS_THRESHOLD,
      ).length;
      const cost = results.reduce((sum, r) => sum + r.cost, 0);

      await this.bulkUploadService.markBatchCompleted(
        bulkUploadId,
        batchIndex,
        {
          succeededCount,
          failedCount: specs.length - succeededCount,
          cost,
        },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(
        `Batch ${batchIndex} of bulk upload ${bulkUploadId} failed: ${message}`,
      );
      await this.bulkUploadService.markBatchFailed(
        bulkUploadId,
        batchIndex,
        message,
      );
      throw err;
    }
  }
}
