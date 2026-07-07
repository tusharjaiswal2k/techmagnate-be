import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { DataForSeoApiException } from './exceptions/dataforseo-api.exception';
import {
  DataForSeoLiveResponse,
  DataForSeoTaskResult,
} from './interfaces/dataforseo-response.interface';
import { DataForSeoTaskSpec } from './interfaces/dataforseo-task-spec.interface';

const SERP_LIVE_ADVANCED_PATH = '/v3/serp/google/organic/live/advanced';
const MAX_SPECS_PER_REQUEST = 100;

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
    if (specs.length < 1 || specs.length > MAX_SPECS_PER_REQUEST) {
      throw new Error(
        `specs must contain between 1 and ${MAX_SPECS_PER_REQUEST} items, got ${specs.length}`,
      );
    }

    const login = this.configService.get<string>('DATAFORSEO_LOGIN');
    const password = this.configService.get<string>('DATAFORSEO_PASSWORD');
    const authHeader =
      'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');

    const payload = specs.map((spec) => ({
      keyword: spec.keyword,
      language_code: spec.language_code,
      location_code: spec.location_code,
      priority: spec.priority,
    }));

    try {
      const { data } = await firstValueFrom(
        this.httpService.post<DataForSeoLiveResponse>(
          SERP_LIVE_ADVANCED_PATH,
          payload,
          { headers: { Authorization: authHeader } },
        ),
      );

      if (!data.tasks || data.tasks.length !== specs.length) {
        throw new DataForSeoApiException(
          `DataForSEO returned ${data.tasks?.length ?? 0} results for ${specs.length} requested tasks`,
        );
      }

      return data.tasks.map((item, i) => ({
        task_id: item.id,
        status_code: item.status_code,
        status_message: item.status_message,
        cost: item.cost,
        time: item.time,
        keyword: specs[i].keyword,
        location_code: specs[i].location_code,
        language_code: specs[i].language_code,
        priority: specs[i].priority,
        rawResult: item,
      }));
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
