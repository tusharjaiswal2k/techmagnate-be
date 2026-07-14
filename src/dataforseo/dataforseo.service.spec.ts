import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { DataForSeoService } from './dataforseo.service';
import { DataForSeoApiException } from './exceptions/dataforseo-api.exception';

function makeSpec(keyword: string) {
  return { keyword, language_code: 'en', location_code: 2840, priority: 1 };
}

function fakeSuccessResponse(keyword: string) {
  return {
    data: {
      version: '0.1',
      status_code: 20000,
      status_message: 'Ok.',
      tasks: [
        {
          id: `task-${keyword}`,
          status_code: 20000,
          status_message: 'Ok.',
          cost: 0.002,
          time: '0.1 sec',
        },
      ],
    },
  };
}

describe('DataForSeoService', () => {
  let service: DataForSeoService;
  let post: jest.Mock;

  beforeEach(async () => {
    post = jest.fn();
    const module = await Test.createTestingModule({
      providers: [
        DataForSeoService,
        { provide: HttpService, useValue: { post } },
        {
          provide: ConfigService,
          useValue: { get: () => 'test' },
        },
      ],
    }).compile();

    service = module.get(DataForSeoService);
  });

  it('sends one HTTP call per task, each with a single-item payload array', async () => {
    const specs = [makeSpec('a'), makeSpec('b'), makeSpec('c')];
    post.mockImplementation((_url, payload) =>
      of(fakeSuccessResponse(payload[0].keyword)),
    );

    const results = await service.postSerpTasksLive(specs);

    expect(post).toHaveBeenCalledTimes(3);
    for (const call of post.mock.calls) {
      const payload = call[1];
      expect(Array.isArray(payload)).toBe(true);
      expect(payload).toHaveLength(1);
    }
    expect(results).toHaveLength(3);
    expect(results.map((r) => r.keyword)).toEqual(['a', 'b', 'c']);
    expect(results.every((r) => r.status_code === 20000)).toBe(true);
  });

  it('throws for a single task whose call fails (preserves single-task error UX)', async () => {
    post.mockReturnValue(throwError(() => new Error('network blip')));

    await expect(
      service.postSerpTasksLive([makeSpec('solo')]),
    ).rejects.toBeInstanceOf(DataForSeoApiException);
  });

  it('does not discard successful results when one task in a batch fails', async () => {
    const specs = [makeSpec('ok-1'), makeSpec('bad'), makeSpec('ok-2')];
    post.mockImplementation((_url, payload) => {
      const keyword = payload[0].keyword;
      if (keyword === 'bad') {
        return throwError(() => new Error('DataForSEO 500'));
      }
      return of(fakeSuccessResponse(keyword));
    });

    const results = await service.postSerpTasksLive(specs);

    expect(results).toHaveLength(3);
    expect(results[0].status_code).toBe(20000);
    expect(results[2].status_code).toBe(20000);
    expect(results[1].status_code).toBeGreaterThanOrEqual(40000);
    expect(results[1].keyword).toBe('bad');
  });

  it('issues one call per task even for a full 100-task batch', async () => {
    const specs = Array.from({ length: 100 }, (_, i) => makeSpec(`k${i}`));
    post.mockImplementation((_url, payload) =>
      of(fakeSuccessResponse(payload[0].keyword)),
    );

    const results = await service.postSerpTasksLive(specs);

    expect(post).toHaveBeenCalledTimes(100);
    expect(results).toHaveLength(100);
  });

  it('rejects batches larger than 100 specs', async () => {
    const specs = Array.from({ length: 101 }, (_, i) => makeSpec(`k${i}`));
    await expect(service.postSerpTasksLive(specs)).rejects.toThrow(
      /between 1 and 100/,
    );
  });
});
