import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

const SORTABLE_FIELDS = [
  'keyword',
  'language_code',
  'location_code',
  'priority',
  'status_code',
  'cost',
  'created_at',
] as const;

export class ListTasksQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(SORTABLE_FIELDS)
  sortBy: (typeof SORTABLE_FIELDS)[number] = 'created_at';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  location?: number;

  @IsOptional()
  @Type(() => Number)
  @IsIn([1, 2])
  priority?: number;

  @IsOptional()
  @IsIn(['success', 'error'])
  status?: 'success' | 'error';

  @IsOptional()
  @IsIn(['single', 'bulk'])
  source?: 'single' | 'bulk';

  @IsOptional()
  @IsISO8601()
  dateFrom?: string;

  @IsOptional()
  @IsISO8601()
  dateTo?: string;
}
