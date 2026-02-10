import {
  Controller,
  Delete,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard'
import { ACCEPTED_FILE_REGEX } from 'src/common/constants'
import { MAX_FILE_SIZE } from 'src/providers/s3/constants/max-file-size.constant'
import { User } from 'src/user/decorator/user.decorator'
import { PhotoService } from './photo.service'

@Controller('photo')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @UseGuards(JwtAccessGuard)
  @Post('/')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadPhoto(
    @User('id') id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: ACCEPTED_FILE_REGEX }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.photoService.uploadPhoto(id, file)

    return result
  }

  @UseGuards(JwtAccessGuard)
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePhoto(@Param('id') id: number) {
    await this.photoService.deletePhoto(id)
  }
}
