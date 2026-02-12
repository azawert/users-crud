import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { PhotoSaveResult } from './dto/photo.dto'
import { Photo } from './photo.entity'

export class PhotoRepository {
  constructor(@InjectRepository(Photo) private readonly repository: Repository<Photo>) {}

  async create(dto: Partial<Photo>): Promise<PhotoSaveResult> {
    const result = await this.repository.save(dto)

    return {
      id: result.id,
      url: result.url,
      userId: result.userId,
    }
  }

  async delete(id: number): Promise<void> {
    await this.repository.softDelete({ id })
  }

  async countAvatarsByUserId(userId: number): Promise<number> {
    return this.repository.countBy({
      user: {
        deletedAt: IsNull(),
        id: userId,
      },
    })
  }

  async getActiveAvatarsByUserId(userId: number): Promise<Photo[]> {
    return this.repository.findBy({
      user: {
        deletedAt: IsNull(),
        id: userId,
      },
    })
  }

  async getPhotoById(photoId: number): Promise<Photo | null> {
    return this.repository.findOneBy({
      id: photoId,
    })
  }
}
