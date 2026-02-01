import { IsEmail, IsNumber, IsOptional, IsString, IsStrongPassword, MaxLength } from 'class-validator';
import { MAX_DESCRIPTION_LENGTH, MIN_PASSWORD_LENGTH } from 'src/common';

export class RegisterDto {
	@IsString()
	login: string

	@IsEmail()
	email: string

	@IsStrongPassword({ minLength: MIN_PASSWORD_LENGTH, })
	password: string

	@IsNumber()
	age: number

	@IsOptional()
	@IsString()
	@MaxLength(MAX_DESCRIPTION_LENGTH)
	description: string
}

export class AuthenticationDto {
	@IsString()
	login: string

	@IsStrongPassword({ minLength: MIN_PASSWORD_LENGTH, })
	password: string
}

export class TokensDto {
	@IsString()
	refreshToken: string

	@IsString()
	accessToken: string
}