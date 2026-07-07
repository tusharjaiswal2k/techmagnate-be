import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { escapeRegex } from '../common/utils/escape-regex';
import { DataForSeoService } from '../dataforseo/dataforseo.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import { Task, TaskDocument } from './schemas/task.schema';

export interface PaginatedTasks {
  data: TaskDocument[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    private readonly dataForSeoService: DataForSeoService,
    private readonly configService: ConfigService,
  ) {}

  async createSingleTask(dto: CreateTaskDto): Promise<TaskDocument> {
    const [result] = await this.dataForSeoService.postSerpTasksLive([
      {
        keyword: dto.keyword,
        language_code: dto.language,
        location_code: dto.location,
        priority: dto.priority,
      },
    ]);

    const createdBy =
      this.configService.get<string>('DEFAULT_CREATED_BY') ?? 'system';

    return this.taskModel.create({
      ...result,
      created_by: createdBy,
      source: 'single',
    });
  }

  async findAll(query: ListTasksQueryDto): Promise<PaginatedTasks> {
    const filter: QueryFilter<TaskDocument> = {};

    if (query.search) {
      filter.keyword = { $regex: escapeRegex(query.search), $options: 'i' };
    }
    if (query.language) filter.language_code = query.language;
    if (query.location !== undefined) filter.location_code = query.location;
    if (query.priority !== undefined) filter.priority = query.priority;
    if (query.source) filter.source = query.source;
    if (query.status === 'success') filter.status_code = { $lt: 40000 };
    if (query.status === 'error') filter.status_code = { $gte: 40000 };
    if (query.dateFrom || query.dateTo) {
      const createdAtFilter: { $gte?: Date; $lte?: Date } = {};
      if (query.dateFrom) createdAtFilter.$gte = new Date(query.dateFrom);
      if (query.dateTo) createdAtFilter.$lte = new Date(query.dateTo);
      filter.created_at = createdAtFilter;
    }

    const sort: Record<string, 1 | -1> = {
      [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1,
    };

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const [data, totalItems] = await Promise.all([
      this.taskModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean<TaskDocument[]>(),
      this.taskModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize) || 1,
      },
    };
  }
}
