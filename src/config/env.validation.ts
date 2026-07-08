import { plainToInstance } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT?: number;

  @IsString()
  MONGODB_URI: string;

  @IsString()
  REDIS_HOST: string;

  @IsOptional()
  @IsInt()
  REDIS_PORT?: number;

  @IsString()
  DATAFORSEO_BASE_URL: string;

  @IsString()
  DATAFORSEO_LOGIN: string;

  @IsString()
  DATAFORSEO_PASSWORD: string;

  @IsString()
  JWT_SECRET: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n${errors.map((e) => e.toString()).join('\n')}`,
    );
  }
  return validatedConfig;
}
