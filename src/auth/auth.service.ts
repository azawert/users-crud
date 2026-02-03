import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common"
import * as bcrypt from 'bcrypt';
import { AuthenticationDto, RegisterDto, TokensDto } from './auth.dto';
import User from 'src/user/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { ERole, REFRESH_TOKEN_SECRET_KEY, ACCESS_TOKEN_SECRET_KEY, REFRESH_TOKEN_EXPIRES_IN, ACCESS_TOKEN_EXPIRES_IN } from 'src/common';

@Injectable()
export class AuthService {
	constructor(private readonly userService: UserService, private readonly jwtService: JwtService, private readonly configService: ConfigService) { }

	private async validateUser(login: string, password: string): Promise<Omit<User, 'passwordHash'>> {
		const user = await this.userService.getByLogin(login)

		if (!user) {
			throw new UnauthorizedException()
		}

		const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash)

		if (!isPasswordCorrect) {
			throw new UnauthorizedException()
		}

		const { passwordHash, ...rest } = user

		return rest
	}

	private async createRefreshToken(id: number, login: string): Promise<string> {
		if (!id || !login) {
			throw new Error('Provide an id or a login')
		}

		const payload = { sub: id, login }

		const token = await this.jwtService.signAsync(payload, { secret: this.configService.get<string>(REFRESH_TOKEN_SECRET_KEY), expiresIn: REFRESH_TOKEN_EXPIRES_IN })

		return token
	}

	private async createAccessToken(id: number, login: string, role: ERole): Promise<string> {
		const payload = { sub: id, login, role }

		const token = await this.jwtService.signAsync(payload, { secret: this.configService.get<string>(ACCESS_TOKEN_SECRET_KEY), expiresIn: ACCESS_TOKEN_EXPIRES_IN })

		return token
	}

	async refreshAccessToken(refreshToken: string): Promise<string> {
		try {
			const decoded = await this.jwtService.verify(refreshToken, {
				secret: this.configService.get<string>(REFRESH_TOKEN_SECRET_KEY)
			})
			const user = await this.userService.getByRefreshToken(refreshToken)

			if (!user) {
				throw new UnauthorizedException(`Invalid refresh token: ${refreshToken}`)
			}

			const newAccessToken = await this.createAccessToken(user.id, user.login, user.role)

			return newAccessToken
		} catch (e) {
			throw new UnauthorizedException(e)
		}
	}

	async login(dto: AuthenticationDto): Promise<TokensDto> {
		try {
			const { login, password } = dto

			const user = await this.validateUser(login, password)

			const [accessToken, refreshToken] = await Promise.all([this.createAccessToken(user.id, login, user.role), this.createRefreshToken(user.id, login)])

			await this.userService.updateRefreshToken(user.id, refreshToken)

			return {
				accessToken,
				refreshToken
			}
		} catch (e) {
			throw new InternalServerErrorException(e)
		}

	}

	async register(dto: RegisterDto): Promise<TokensDto> {
		try {
			const { password, isAdmin, ...rest } = dto
			const hashPassword = await bcrypt.hash(password, 10)
			const roleToCreate = isAdmin ? ERole.ADMIN : ERole.USER
			const createdUser = await this.userService.createNewUser({ password: hashPassword, role: roleToCreate, ...rest })

			const [accessToken, refreshToken] = await Promise.all([this.createAccessToken(createdUser.id, createdUser.login, createdUser.role), this.createRefreshToken(createdUser.id, createdUser.login)])


			await this.userService.updateRefreshToken(createdUser.id, refreshToken);

			return {
				accessToken,
				refreshToken
			}
		} catch (e) {
			throw new InternalServerErrorException(e)
		}
	}
}
