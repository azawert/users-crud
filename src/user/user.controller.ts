import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Query, UseGuards } from '@nestjs/common'
import { JwtAccessGuard } from 'src/auth/jwt-access.guard'
import { Roles } from 'src/auth/roles.decorator'
import { RolesGuard } from 'src/auth/roles.guard'
import { ERole } from 'src/common'
import type { PaginationQueryDto } from 'src/common/common.dto'
import { User } from './user.decorator'
import type { UpdateUserDto } from './user.dto'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAccessGuard)
  @Get('me')
  async getMe(@User('id') id: number) {
    return this.userService.getById(id)
  }

  @UseGuards(JwtAccessGuard)
  @Get('all')
  @HttpCode(HttpStatus.OK)
  async getAll(@Query() { showDeleted, page, size }: PaginationQueryDto & { showDeleted: boolean }) {
    return this.userService.getAllUsers(size, page, showDeleted)
  }

  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(ERole.ADMIN)
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(@Param('id') id: number) {
    return this.userService.deleteUser(id)
  }

  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(ERole.ADMIN)
  @Patch('/update-profile/:id')
  @HttpCode(HttpStatus.OK)
  async updateMe(@Param('id') id: number, @Body() body: UpdateUserDto) {
    return await this.userService.updateUser(id, body)
  }
}
