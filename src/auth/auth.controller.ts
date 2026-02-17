import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common'
import type { Response } from 'express'
import { COOKIE_MAX_AGE } from 'src/common'
import { User } from 'src/user/decorator/user.decorator'
import { AuthService } from './auth.service'
import { AuthenticationDto, RegisterDto } from './dto/auth.dto'
import { JwtRefreshGuard } from './guards/jwt-refresh.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() req: AuthenticationDto, @Res() res: Response) {
    const tokens = await this.authService.login(req)

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
    })

    return res.json({
      accessToken: tokens.accessToken,
    })
  }

  @Post('registration')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() req: RegisterDto, @Res() res: Response) {
    const tokens = await this.authService.register(req)

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
    })

    return res.json({
      accessToken: tokens.accessToken,
    })
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@User('refreshToken') refreshToken: string) {
    const newAccessToken = await this.authService.refreshAccessToken(refreshToken)

    return {
      accessToken: newAccessToken,
    }
  }
}
