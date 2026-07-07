import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DataForSeoModule } from '../dataforseo/dataforseo.module';
import { Task, TaskSchema } from './schemas/task.schema';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    DataForSeoModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [MongooseModule],
})
export class TasksModule {}
