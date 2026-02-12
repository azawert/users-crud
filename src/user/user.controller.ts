import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Query, UseGuards } from '@nestjs/common'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { ERole } from 'src/common'
import type { PaginationQueryDto } from 'src/common/common.dto'
import { User } from './decorator/user.decorator'
import type { MostActiveUserRequestDto, UpdateUserDto } from './dto/user.dto'
import TUser from './user.entity'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAccessGuard)
  @Get('me')
  async getMe(@User() user: TUser) {
    return user
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

  @UseGuards(JwtAccessGuard)
  @Get('/active')
  @HttpCode(HttpStatus.OK)
  async getMostActiveUsers(@Query() query: MostActiveUserRequestDto) {
    return await this.userService.getMostActiveUsers(query)
  }
}
