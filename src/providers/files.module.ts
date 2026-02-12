import { Module } from '@nestjs/common'

import { IFileService } from './files.adapter'
import { S3Module } from './s3/s3.module'
import { S3Service } from './s3/s3.service'

@Module({
  exports: [IFileService],
  imports: [S3Module],
  providers: [
    {
      provide: IFileService,
      useClass: S3Service,
    },
  ],
})
export class FilesModule {}
