import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { chunkArray } from '../common/utils/chunk-array';
import { DataForSeoApiException } from './exceptions/dataforseo-api.exception';
import {
  DataForSeoLiveResponse,
  DataForSeoTaskResult,
} from './interfaces/dataforseo-response.interface';
import { DataForSeoTaskSpec } from './interfaces/dataforseo-task-spec.interface';

const SERP_LIVE_ADVANCED_PATH = '/v3/serp/google/organic/live/advanced';
// DataForSEO's Live SERP Advanced endpoint accepts exactly one task per
// API call, so a "batch" here means N individual calls, not one call
// with N tasks in the payload.
const MAX_SPECS_PER_BATCH = 100;
const TASK_REQUEST_CONCURRENCY = 20;
const SYNTHETIC_FAILURE_STATUS_CODE = 50000;

@Injectable()
export class DataForSeoService {
  private readonly logger = new Logger(DataForSeoService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async postSerpTasksLive(
    specs: DataForSeoTaskSpec[],
  ): Promise<DataForSeoTaskResult[]> {
    if (specs.length < 1 || specs.length > MAX_SPECS_PER_BATCH) {
      throw new Error(
        `specs must contain between 1 and ${MAX_SPECS_PER_BATCH} items, got ${specs.length}`,
      );
    }

    const isSingleTask = specs.length === 1;
    const results: DataForSeoTaskResult[] = new Array(specs.length);

    for (const chunk of chunkArray(
      specs.map((spec, index) => ({ spec, index })),
      TASK_REQUEST_CONCURRENCY,
    )) {
      const settled = await Promise.allSettled(
        chunk.map(({ spec }) => this.postSingleTask(spec)),
      );

      settled.forEach((outcome, i) => {
        const { spec, index } = chunk[i];
        if (outcome.status === 'fulfilled') {
          results[index] = outcome.value;
          return;
        }

        if (isSingleTask) throw outcome.reason;

        const message =
          outcome.reason instanceof Error
            ? outcome.reason.message
            : 'Unknown DataForSEO error';
        results[index] = {
          task_id: '',
          status_code: SYNTHETIC_FAILURE_STATUS_CODE,
          status_message: message,
          cost: 0,
          time: '0.0000 sec',
          keyword: spec.keyword,
          location_code: spec.location_code,
          language_code: spec.language_code,
          priority: spec.priority,
          rawResult: {
            id: '',
            status_code: SYNTHETIC_FAILURE_STATUS_CODE,
            status_message: message,
            cost: 0,
            time: '0.0000 sec',
          },
        };
      });
    }

    return results;
  }

  private async postSingleTask(
    spec: DataForSeoTaskSpec,
  ): Promise<DataForSeoTaskResult> {
    const login = this.configService.get<string>('DATAFORSEO_LOGIN');
    const password = this.configService.get<string>('DATAFORSEO_PASSWORD');
    const authHeader =
      'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');

    const payload = [
      {
        keyword: spec.keyword,
        language_code: spec.language_code,
        location_code: spec.location_code,
        priority: spec.priority,
      },
    ];

    try {
      const { data } = await firstValueFrom(
        this.httpService.post<DataForSeoLiveResponse>(
          SERP_LIVE_ADVANCED_PATH,
          payload,
          { headers: { Authorization: authHeader } },
        ),
      );

      const item = data.tasks?.[0];
      if (!item) {
        throw new DataForSeoApiException(
          `DataForSEO returned no result for keyword "${spec.keyword}"`,
        );
      }

      return {
        task_id: item.id,
        status_code: item.status_code,
        status_message: item.status_message,
        cost: item.cost,
        time: item.time,
        keyword: spec.keyword,
        location_code: spec.location_code,
        language_code: spec.language_code,
        priority: spec.priority,
        rawResult: item,
      };
    } catch (err) {
      if (err instanceof DataForSeoApiException) throw err;
      const axiosErr = err as AxiosError;
      const message = axiosErr.response
        ? `DataForSEO API error ${axiosErr.response.status}: ${JSON.stringify(axiosErr.response.data)}`
        : `DataForSEO API request failed: ${axiosErr.message}`;
      this.logger.error(message);
      throw new DataForSeoApiException(message, err);
    }
  }
}
