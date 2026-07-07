import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DataForSeoModule } from '../dataforseo/dataforseo.module';
import { Task, TaskSchema } from '../tasks/schemas/task.schema';
import { BulkUploadController } from './bulk-upload.controller';
import { BulkUploadService } from './bulk-upload.service';
import { CsvParserService } from './csv-parser.service';
import { BulkUploadProcessor } from './queue/bulk-upload.processor';
import { DATAFORSEO_BATCH_QUEUE } from './queue/queue.constants';
import { BulkUpload, BulkUploadSchema } from './schemas/bulk-upload.schema';

const bullBoardEnabled = process.env.ENABLE_BULL_BOARD !== 'false';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BulkUpload.name, schema: BulkUploadSchema },
      { name: Task.name, schema: TaskSchema },
    ]),
    BullModule.registerQueue({ name: DATAFORSEO_BATCH_QUEUE }),
    ...(bullBoardEnabled
      ? [
          BullBoardModule.forFeature({
            name: DATAFORSEO_BATCH_QUEUE,
            adapter: BullMQAdapter,
          }),
        ]
      : []),
    DataForSeoModule,
  ],
  controllers: [BulkUploadController],
  providers: [BulkUploadService, CsvParserService, BulkUploadProcessor],
})
export class BulkUploadModule {}
