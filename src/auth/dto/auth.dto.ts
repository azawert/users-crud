import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsStrongPassword,
  Max,
  MaxLength,
  Min,
} from 'class-validator'
import { MAX_DESCRIPTION_LENGTH, MIN_PASSWORD_LENGTH } from 'src/common'

export class RegisterDto {
  @IsString()
  login: string

  @IsEmail()
  email: string

  @IsStrongPassword({ minLength: MIN_PASSWORD_LENGTH })
  password: string

  @IsNumber()
  @Min(1)
  @Max(110)
  @Type(() => Number)
  age: number

  @IsOptional()
  @IsString()
  @MaxLength(MAX_DESCRIPTION_LENGTH)
  description: string

  @IsOptional()
  @IsBoolean()
  isAdmin: boolean = false
}

export class AuthenticationDto {
  @IsString()
  login: string

  @IsStrongPassword({ minLength: MIN_PASSWORD_LENGTH })
  password: string
}
