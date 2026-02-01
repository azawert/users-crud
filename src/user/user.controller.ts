import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Query, Req, UseGuards } from "@nestjs/common"
import { JwtAccessGuard } from 'src/auth/jwt-access.guard'
import { UserService } from './user.service'
import { PaginationQueryDto } from 'src/common/common.dto'
import User from './user.entity'
import type { Request } from 'express'
import { UpdateUserDto } from './user.dto'

@Controller("user")
export class UserController {
	constructor(private readonly userService: UserService) { }

	@UseGuards(JwtAccessGuard)
	@Get('me')
	async getMe(@Req() req) {
		const user = await this.userService.getMe(req.user.id)

		return {
			login: user?.login,
			email: user?.email,
			age: user?.age,
			description: user?.description
		}
	}

	@UseGuards(JwtAccessGuard)
	@Get('all')
	@HttpCode(HttpStatus.OK)
	async getAll(@Query() { showDeleted, page, size }: PaginationQueryDto & { showDeleted: boolean }) {
		console.log(showDeleted)
		const response = await this.userService.getAllUsers(size, page, showDeleted)
		response.data = response.data.map(user => ({
			login: user?.login,
			email: user?.email,
			age: user?.age,
			description: user?.description
		}))
		return response
	}

	@UseGuards(JwtAccessGuard)
	@Delete('')
	@HttpCode(HttpStatus.NO_CONTENT)
	async deleteMe(@Req() req) {
		return this.userService.deleteUser(req.user.id)
	}

	@UseGuards(JwtAccessGuard)
	@Patch('/update-profile')
	@HttpCode(HttpStatus.OK)
	async updateMe(@Req() req: Request & { user: User }, @Body() body: UpdateUserDto) {
		const userId = req.user.id
		const updatedUser = await this.userService.updateUser(userId, body)

		return {
			login: updatedUser?.login,
			email: updatedUser?.email,
			age: updatedUser?.age,
			description: updatedUser?.description
		}
	}
}
