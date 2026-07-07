import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'tasks',
})
export class Task {
  @Prop({ required: true, index: true })
  task_id: string;

  @Prop({ required: true })
  status_code: number;

  @Prop({ required: true })
  status_message: string;

  @Prop({ required: true })
  cost: number;

  @Prop({ required: true })
  time: string;

  @Prop({ required: true, index: true })
  keyword: string;

  @Prop({ required: true, index: true })
  location_code: number;

  @Prop({ required: true, index: true })
  language_code: string;

  @Prop({ required: true, enum: [1, 2], index: true })
  priority: number;

  @Prop({ required: true, default: 'system' })
  created_by: string;

  @Prop({
    required: true,
    enum: ['single', 'bulk'],
    default: 'single',
    index: true,
  })
  source: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'BulkUpload' })
  bulkUploadId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Mixed })
  rawResult?: Record<string, unknown>;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
TaskSchema.index({ created_at: -1 });
