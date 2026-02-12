import { OmitType, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEmail, IsEnum, IsNumber, IsOptional, IsString, IsStrongPassword, MaxLength } from 'class-validator'
import { ERole, MAX_DESCRIPTION_LENGTH, MIN_PASSWORD_LENGTH } from 'src/common'

export class CreateUserDto {
  @IsString()
  login: string

  @IsEmail()
  email: string

  @IsStrongPassword({ minLength: MIN_PASSWORD_LENGTH })
  password: string

  @IsOptional()
  @IsString()
  @MaxLength(MAX_DESCRIPTION_LENGTH)
  description: string

  @IsEnum(ERole)
  role: ERole

  @IsNumber()
  age: number
}

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password'])) {}

export class MostActiveUserRequestDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minAge: number = 10

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxAge: number = 50
}
