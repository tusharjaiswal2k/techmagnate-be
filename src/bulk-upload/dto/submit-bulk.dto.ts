import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CsvRowDto } from './csv-row.dto';

export class SubmitBulkDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CsvRowDto)
  rows: CsvRowDto[];

  @IsOptional()
  @IsString()
  originalFilename?: string;
}
