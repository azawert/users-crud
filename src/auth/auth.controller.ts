import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from "@nestjs/common"
import { AuthService } from './auth.service';
import { AuthenticationDto, RegisterDto } from './auth.dto';
import type { Response } from 'express';
import { JwtRefreshGuard } from './jwt-refresh.guard';

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@Post('login')
	@HttpCode(HttpStatus.OK)
	async login(@Body() req: AuthenticationDto, @Res() res: Response) {
		const tokens = await this.authService.login(req)

		res.cookie('refreshToken', tokens.refreshToken, {
			httpOnly: true,
			maxAge: 7 * 24 * 60 * 60 * 1000,
		})

		return res.json({
			accessToken: tokens.accessToken
		})
	}

	@Post('registration')
	@HttpCode(HttpStatus.CREATED)
	async register(@Body() req: RegisterDto, @Res() res: Response) {
		const tokens = await this.authService.register(req)

		res.cookie('refreshToken', tokens.refreshToken, {
			httpOnly: true,
			maxAge: 7 * 24 * 60 * 60 * 1000,
		})

		return res.json({
			accessToken: tokens.accessToken
		})
	}

	@UseGuards(JwtRefreshGuard)
	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	async refreshToken(@Req() req) {
		const newAccessToken = await this.authService.refreshAccessToken(req.user.refreshToken)

		return {
			accessToken: newAccessToken
		}
	}
}
