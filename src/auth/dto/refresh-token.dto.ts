import { IsString } from 'class-validator'

export class TokensDto {
  @IsString()
  refreshToken: string

  @IsString()
  accessToken: string
}
