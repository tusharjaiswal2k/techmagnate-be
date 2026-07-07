import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataForSeoService } from './dataforseo.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('DATAFORSEO_BASE_URL'),
        timeout: 60000,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [DataForSeoService],
  exports: [DataForSeoService],
})
export class DataForSeoModule {}
