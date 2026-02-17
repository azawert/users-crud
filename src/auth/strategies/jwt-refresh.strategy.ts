import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JWT_REFRESH_STRATEGY_NAME, REFRESH_TOKEN_SECRET_KEY, type TConfigService } from 'src/common'
import User from 'src/user/user.entity'
import { UserService } from 'src/user/user.service'
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, JWT_REFRESH_STRATEGY_NAME) {
  constructor(
    private readonly userService: UserService,
    readonly configService: TConfigService,
  ) {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const token = req.headers.cookie?.split('=')[1]

          return token || ''
        },
      ]),
      passReqToCallback: true,
      secretOrKey: configService.getOrThrow(REFRESH_TOKEN_SECRET_KEY),
    })
  }
  async validate(req: Request, payload: { sub: number }): Promise<User> {
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
