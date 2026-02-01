import { OmitType, PartialType } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsStrongPassword, MaxLength } from 'class-validator';
import { MAX_DESCRIPTION_LENGTH, MIN_PASSWORD_LENGTH } from 'src/common';

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
}

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password'])) { }