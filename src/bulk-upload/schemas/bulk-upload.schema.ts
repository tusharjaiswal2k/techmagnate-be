import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BulkUploadDocument = BulkUpload & Document;

export type BatchProcessingStatus =
  'queued' | 'processing' | 'completed' | 'failed';

export class BatchStatus {
  @Prop({ required: true })
  batchIndex: number;

  @Prop({ required: true })
  jobId: string;

  @Prop({ required: true })
  taskCount: number;

  @Prop({
    required: true,
    enum: ['queued', 'processing', 'completed', 'failed'],
    default: 'queued',
  })
  status: BatchProcessingStatus;

  @Prop()
  succeededCount?: number;

  @Prop()
  failedCount?: number;

  @Prop()
  cost?: number;

  @Prop()
  error?: string;

  @Prop()
  processedAt?: Date;
}

export type BulkUploadStatus =
  'queued' | 'processing' | 'completed' | 'completed_with_errors' | 'failed';

@Schema({ timestamps: true, collection: 'bulk_uploads' })
export class BulkUpload {
  @Prop({ required: true })
  originalFilename: string;

  @Prop({ required: true })
  totalRows: number;

  @Prop({ required: true })
  validRowCount: number;

  @Prop({ required: true })
  invalidRowCount: number;

  @Prop({ required: true, default: 'system' })
  created_by: string;

  @Prop({
    required: true,
    enum: [
      'queued',
      'processing',
      'completed',
      'completed_with_errors',
      'failed',
    ],
    default: 'queued',
  })
  status: BulkUploadStatus;

  @Prop({ required: true })
  totalBatches: number;

  @Prop({ default: 0 })
  completedBatches: number;

  @Prop({ default: 0 })
  failedBatches: number;

  @Prop({ type: [Object], default: [] })
  batches: BatchStatus[];

  @Prop({ default: 0 })
  totalCost: number;
}

export const BulkUploadSchema = SchemaFactory.createForClass(BulkUpload);
