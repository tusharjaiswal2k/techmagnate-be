import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BulkUploadService } from './bulk-upload.service';
import { CsvParserService } from './csv-parser.service';
import { SubmitBulkDto } from './dto/submit-bulk.dto';

@Controller('bulk-upload')
export class BulkUploadController {
  constructor(
    private readonly bulkUploadService: BulkUploadService,
    private readonly csvParserService: CsvParserService,
  ) {}

  @Post('preview')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: Number(process.env.MAX_CSV_SIZE_BYTES ?? 5 * 1024 * 1024),
      },
    }),
  )
  preview(@UploadedFile() file: Express.Multer.File) {
    if (!file)
      throw new BadRequestException('CSV file is required (field "file")');
    return this.csvParserService.parseAndValidate(file.buffer);
  }

  @Post('submit')
  submit(@Body() dto: SubmitBulkDto) {
    return this.bulkUploadService.submit(dto.rows, dto.originalFilename);
  }

  @Get(':id/status')
  getStatus(@Param('id') id: string) {
    return this.bulkUploadService.getStatus(id);
  }
}
