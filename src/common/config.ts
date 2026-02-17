import z from 'zod'

export const envs = z.object({
  ACCESS_TOKEN_SECRET_KEY: z.string(),
  BUCKET_NAME: z.string(),
  DB_HOST: z.string(),
  DB_NAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_PORT: z.string(),
  DB_USERNAME: z.string(),
  MAX_PHOTOS_COUNT: z.number(),
  MINIO_ACCESS_KEY: z.string(),
  MINIO_ADMIN: z.string(),
  MINIO_PASSWORD: z.string(),
  MINIO_SECRET_KEY: z.string(),
  PHOTO_FOLDER: z.string(),
  PORT: z.number(),
  REDIS_HOST: z.string(),
  REDIS_PASSWORD: z.string(),
  REDIS_PORT: z.string(),
  REFRESH_TOKEN_SECRET_KEY: z.string(),
  SECRET_KEY: z.string(),
})

export const validateSchema = config => {
  const validated = envs.parse(config)

  return validated
}
