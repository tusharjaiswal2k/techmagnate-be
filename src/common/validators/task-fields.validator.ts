import { LANGUAGE_CODES } from '../constants/languages';
import { LOCATION_CODES } from '../constants/locations';

export interface TaskFieldsInput {
  keyword?: string;
  language?: string;
  location?: string | number;
  priority?: string | number;
}

export interface TaskFieldsValidationResult {
  valid: boolean;
  reasons: string[];
  normalized: {
    keyword: string;
    language_code: string;
    location_code: number;
    priority: number;
  } | null;
}

export function validateTaskFields(
  input: TaskFieldsInput,
): TaskFieldsValidationResult {
  const reasons: string[] = [];

  const keyword = typeof input.keyword === 'string' ? input.keyword.trim() : '';
  if (!keyword) reasons.push('keyword is required');

  const language =
    typeof input.language === 'string' ? input.language.trim() : '';
  if (!language) {
    reasons.push('language is required');
  } else if (!LANGUAGE_CODES.includes(language)) {
    reasons.push(`language "${language}" is not a supported language_code`);
  }

  const locationRaw =
    typeof input.location === 'number'
      ? input.location
      : typeof input.location === 'string' && input.location.trim() !== ''
        ? Number(input.location.trim())
        : NaN;
  if (
    input.location === undefined ||
    input.location === null ||
    input.location === ''
  ) {
    reasons.push('location is required');
  } else if (Number.isNaN(locationRaw)) {
    reasons.push('location must be a numeric location_code');
  } else if (!LOCATION_CODES.includes(locationRaw)) {
    reasons.push(
      `location "${String(input.location)}" is not a supported location_code`,
    );
  }

  const priorityRaw =
    typeof input.priority === 'number'
      ? input.priority
      : typeof input.priority === 'string' && input.priority.trim() !== ''
        ? Number(input.priority.trim())
        : NaN;
  if (
    input.priority === undefined ||
    input.priority === null ||
    input.priority === ''
  ) {
    reasons.push('priority is required');
  } else if (![1, 2].includes(priorityRaw)) {
    reasons.push('priority must be 1 or 2');
  }

  const valid = reasons.length === 0;

  return {
    valid,
    reasons,
    normalized: valid
      ? {
          keyword,
          language_code: language,
          location_code: locationRaw,
          priority: priorityRaw,
        }
      : null,
  };
}
