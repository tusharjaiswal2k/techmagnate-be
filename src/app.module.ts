import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BulkUploadModule } from './bulk-upload/bulk-upload.module';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { TasksModule } from './tasks/tasks.module';

const bullBoardEnabled = process.env.ENABLE_BULL_BOARD !== 'false';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongodbUri'),
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
          password: configService.get<string>('redis.password'),
        },
      }),
      inject: [ConfigService],
    }),
    ...(bullBoardEnabled
      ? [
          BullBoardModule.forRoot({
            route: '/admin/queues',
            adapter: ExpressAdapter,
          }),
        ]
      : []),
    TasksModule,
    BulkUploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
