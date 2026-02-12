import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { S3Module } from 'src/providers/s3/s3.module'
import { PhotoController } from './photo.controller'
import { Photo } from './photo.entity'
import { PhotoRepository } from './photo.repository'
import { PhotoService } from './photo.service'

@Module({
  controllers: [PhotoController],
  exports: [PhotoService],
  imports: [TypeOrmModule.forFeature([Photo]), S3Module],
  providers: [PhotoService, PhotoRepository],
})
export class PhotoModule {}
