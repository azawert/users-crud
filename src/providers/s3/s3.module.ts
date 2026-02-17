import * as AWS from '@aws-sdk/client-s3'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import type { TConfigService } from 'src/common'
import { S3Lib } from './constants/do-spaces-service-lib.constant'
import { S3Service } from './s3.service'

@Module({
  exports: [S3Service, S3Lib],
  imports: [ConfigModule],
  providers: [
    S3Service,
    {
      provide: S3Lib,
      useFactory: async (configService: TConfigService) => {
        return new AWS.S3({
          credentials: {
            accessKeyId: configService.getOrThrow('MINIO_ACCESS_KEY'),
            secretAccessKey: configService.getOrThrow('MINIO_SECRET_KEY'),
          },
          endpoint: 'http://127.0.0.1:9000',
          region: 'ru-central1',
        })
      },
    },
  ],
})
export class S3Module {}
