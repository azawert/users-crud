import { IUploadedMulterFile } from '../s3/interfaces/upload-file.interface'

export function generateFileMock(size = 1024 * 1024): IUploadedMulterFile {
  return {
    buffer: Buffer.alloc(size),
    encoding: 'jpeg',
    fieldname: 'imageUpload',
    mimetype: 'image/png',
    originalname: 'sample.jpg',
    size,
  }
}
