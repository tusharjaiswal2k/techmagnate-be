import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { LANGUAGE_CODES } from '../../common/constants/languages';
import { LOCATION_CODES } from '../../common/constants/locations';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  keyword: string;

  @IsIn(LANGUAGE_CODES)
  language: string;

  @Type(() => Number)
  @IsIn(LOCATION_CODES)
  location: number;

  @Type(() => Number)
  @IsIn([1, 2])
  priority: number;
}
