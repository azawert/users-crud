import { ConfigService } from '@nestjs/config'
import z from 'zod'
import { envs } from './config'

export enum ERole {
  ADMIN = 'admin',
  USER = 'user',
}

export type TConfigService = ConfigService<z.infer<typeof envs>>
