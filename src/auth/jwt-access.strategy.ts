import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ACCESS_TOKEN_SECRET_KEY, JWT_ACCESS_STRATEGY_NAME } from 'src/common'
import type User from 'src/user/user.entity'
import { UserService } from 'src/user/user.service'
@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, JWT_ACCESS_STRATEGY_NAME) {
  constructor(
    private readonly userService: UserService,
    readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow(ACCESS_TOKEN_SECRET_KEY),
    })
  }
  async validate(payload: { sub: number }): Promise<User> {
    const { sub: userId } = payload
    const user = await this.userService.getById(userId)

    if (!user) {
      throw new UnauthorizedException()
    }
    return user
  }
}
