import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  createTask(@Body() dto: CreateTaskDto) {
    return this.tasksService.createSingleTask(dto);
  }

  @Get()
  findAll(@Query() query: ListTasksQueryDto) {
    return this.tasksService.findAll(query);
  }
}
