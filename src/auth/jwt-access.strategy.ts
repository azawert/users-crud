import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ACCESS_TOKEN_SECRET_KEY } from 'src/common';
import type User from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
	constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get(ACCESS_TOKEN_SECRET_KEY)!,
		});
	}
	async validate(payload: any): Promise<User> {
		const { sub: userId } = payload;
		const user = await this.userService.getById(userId);

		if (!user) {
			throw new UnauthorizedException();
		}
		return user;
	}
}