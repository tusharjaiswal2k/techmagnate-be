import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { validateTaskFields } from '../common/validators/task-fields.validator';

export interface CsvPreviewRow {
  keyword: string;
  language: string;
  location: number;
  priority: number;
}

export interface CsvInvalidRow {
  rowNumber: number;
  data: Record<string, unknown>;
  reasons: string[];
}

export interface CsvPreviewResult {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  validRows: CsvPreviewRow[];
  invalidRows: CsvInvalidRow[];
}

@Injectable()
export class CsvParserService {
  parseAndValidate(buffer: Buffer): CsvPreviewResult {
    const rawRows: Record<string, string>[] = parse(buffer.toString('utf-8'), {
      columns: (header: string[]) => header.map((h) => h.trim().toLowerCase()),
      skip_empty_lines: true,
      trim: true,
    });

    const validRows: CsvPreviewRow[] = [];
    const invalidRows: CsvInvalidRow[] = [];

    rawRows.forEach((row, index) => {
      const result = validateTaskFields({
        keyword: row.keyword,
        language: row.language,
        location: row.location,
        priority: row.priority,
      });

      if (result.valid && result.normalized) {
        validRows.push({
          keyword: result.normalized.keyword,
          language: result.normalized.language_code,
          location: result.normalized.location_code,
          priority: result.normalized.priority,
        });
      } else {
        invalidRows.push({
          rowNumber: index + 2, // +1 for 0-index, +1 for header row
          data: row,
          reasons: result.reasons,
        });
      }
    });

    return {
      totalRows: rawRows.length,
      validCount: validRows.length,
      invalidCount: invalidRows.length,
      validRows,
      invalidRows,
    };
  }
}
