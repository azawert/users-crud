import { ConflictException, Injectable } from '@nestjs/common'
import { PaginatedResponse } from 'src/common/common.dto'
import { RedisService } from 'src/providers/redis/redis.service'
import { CreateUserDto, MostActiveUserRequestDto, UpdateUserDto } from './dto/user.dto'
import User from './user.entity'
import { IUserRepository } from './user-repository.interface'

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly redisService: RedisService,
  ) {}

  async getByLogin(login: string) {
    return this.userRepository.findUserByLogin(login)
  }

  async getById(id: number) {
    const userFromCache = await this.redisService.get<User>(`${id}`)
    if (userFromCache) {
      return userFromCache
    }
    const data = await this.userRepository.findUserById(id)
    await this.redisService.set(`${id}`, data)
    return data
  }

  async getByRefreshToken(refreshToken: string) {
    return this.userRepository.findUserByRefreshToken(refreshToken)
  }

  async createNewUser(data: CreateUserDto) {
    const existingUser = await this.getByLogin(data.login)

    if (existingUser) {
      throw new ConflictException()
    }

    const createdUser = await this.userRepository.createUser(data)
    await this.redisService.set(`${createdUser.id}`, createdUser)

    return createdUser
  }

  async updateRefreshToken(userId: number, token: string) {
    return this.userRepository.updateToken(userId, token)
  }

  async getAllUsers(
    limit: number,
    page: number,
    includeDeleted: boolean = false,
  ): Promise<PaginatedResponse<Partial<User>>> {
    const response = await this.userRepository.findAllUsers(limit, page, includeDeleted)
    const [users, total] = response

    return {
      currentPage: page,
      data: users,
      limit,
      totalCount: total,
    }
  }

  async deleteUser(id: number) {
    await this.redisService.delete(`${id}`)
    return this.userRepository.deleteUser(id)
  }

  async updateUser(id: number, data: UpdateUserDto) {
    return this.userRepository.updateUser(id, data)
  }

  async getMostActiveUsers(params: MostActiveUserRequestDto) {
    const keyForRedis = 'users:active'
    const cachedValue = await this.redisService.get(keyForRedis)
    if (cachedValue !== null) {
      return cachedValue
    }

    const response = await this.userRepository.getMostActiveUsers(params)
    if (response) {
      await this.redisService.set(keyForRedis, response)
    }

    return response
  }
}
