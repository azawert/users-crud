import { BadRequestException, HttpException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { S3Service } from 'src/providers/s3/s3.service'
import { PhotoRepository } from './photo.repository'

const MAX_PHOTOS_COUNT = 5

@Injectable()
export class PhotoService {
  private readonly photoFolder
  private readonly logger = new Logger(PhotoService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
    private readonly photoRepo: PhotoRepository,
  ) {
    this.photoFolder = this.configService.getOrThrow<string>('PHOTO_FOLDER')
    this.logger.log('PhotoService init')
  }

  public async uploadPhoto(userId: number, photo: Express.Multer.File) {
    try {
      const isPhotoUploadAvailable = await this.isPhotoUploadAvailable(userId)

      if (!isPhotoUploadAvailable) {
        this.logger.error(`User with id: ${userId}, reached max photos count: ${MAX_PHOTOS_COUNT}`)
        throw new BadRequestException('Maximum avatars reached')
      }
      const fileName = this.generateFilename(photo.originalname)

      this.logger.log(`Starting upload file: ${fileName} with userId: ${userId}`)
      const { path } = await this.s3Service.uploadFile({ file: photo, folder: this.photoFolder, name: fileName })
      this.logger.log(`Photo uploaded. Path: ${path}`)

      this.logger.log('Begin to upload file path to an photo repo')
      const result = await this.photoRepo.create({
        url: path,
        userId,
      })
      this.logger.log(
        `Successful creation of photo entity in photo database with userId: ${result.userId}, url: ${result.url}, photoId: ${result.id}`,
      )

      return result
    } catch (error) {
      this.logger.error(error)
      if (error instanceof HttpException) {
        throw new HttpException(error, error.getStatus()).getResponse()
      }
    }
  }

  public async deletePhoto(photoId: number) {
    try {
      const isPhotoExists = await this.isPhotoExists(photoId)

      if (!isPhotoExists) {
        this.logger.error(`Photo with ${photoId} not found`)
        throw new NotFoundException(`Photo with ${photoId} not found`)
      }

      this.logger.log(`Start deleting of photo with id: ${photoId}`)
      await this.photoRepo.delete(photoId)
      this.logger.log(`Successfully deleted photo with id: ${photoId}`)
    } catch (error) {
      this.logger.error(`Error while deleting photo with id:${photoId}, error: ${error}`)
    }
  }

  private async isPhotoUploadAvailable(userId: number): Promise<boolean> {
    const activePhotos = await this.photoRepo.countAvatarsByUserId(userId)

    return activePhotos < MAX_PHOTOS_COUNT
  }

  private generateFilename(originalName: string): string {
    return `${crypto.randomUUID()}.${originalName.split('.').pop()}`
  }

  private async isPhotoExists(photoId: number): Promise<boolean> {
    const isExisting = await this.photoRepo.getPhotoById(photoId)

    return Boolean(isExisting)
  }
}
