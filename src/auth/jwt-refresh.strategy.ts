import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_REFRESH_STRATEGY_NAME, REFRESH_TOKEN_SECRET_KEY } from 'src/common';
import User from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, JWT_REFRESH_STRATEGY_NAME) {
	constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => {
				const token = req.headers.cookie?.split('=')[1]

				return token || ''
			}]),
			secretOrKey: configService.get(REFRESH_TOKEN_SECRET_KEY)!,
			passReqToCallback: true,
			ignoreExpiration: false,
		});
	}
	async validate(req: Request, payload: any): Promise<User> {
		const refreshToken = req.headers.cookie?.split('=')[1]

		if (!refreshToken) {
			throw new UnauthorizedException()
		}

		const user = await this.userService.getById(payload.sub)

		if (!user) {
			throw new UnauthorizedException()
		}

		const isTokenValid = user.refreshToken === refreshToken

		if (!isTokenValid) {
			throw new UnauthorizedException()
		}

		return user
	}
}