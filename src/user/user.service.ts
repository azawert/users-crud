import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import Decimal from 'decimal.js'
import { PaginatedResponse } from 'src/common/common.dto'
import { RedisService } from 'src/providers/redis/redis.service'
import { Transactional } from 'typeorm-transactional'
import { CreateUserDto, MostActiveUserRequestDto, SendMoneyToUserRequestDto, UpdateUserDto } from './dto/user.dto'
import User from './user.entity'
import { IUserRepository } from './user-repository.interface'

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger(UserService.name)

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

  @Transactional()
  async sendMoneyToUser(dto: SendMoneyToUserRequestDto) {
    const { amount, payeeId, payerId } = dto

    this.logger.log(`Extracting users with ids: [${payerId}, ${payeeId}]`)
    const [payer, payee] = await Promise.all([this.getById(payerId), this.getById(payeeId)])

    if (!payer || !payee) {
      this.logger.error('Couldnt extract from db users with specified ids')
      throw new NotFoundException()
    }
    this.logger.log('Checking that payer have needed amount of money')
    const isTransferPossible = this.isTransferPossible(payer.balance, amount)

    if (!isTransferPossible) {
      this.logger.error(`Payer dont have much balance. PayerId: ${payerId}`)
      throw new BadRequestException()
    }

    const newPayerAmount = payer.balance.minus(amount)
    const newPayeeAmount = payee.balance.plus(amount)

    await this.userRepository.updateBalance(payerId, newPayerAmount)
    await this.userRepository.updateBalance(payeeId, newPayeeAmount)
  }

  private isTransferPossible(oldAmount: Decimal, newAmount: Decimal): boolean {
    return oldAmount.minus(newAmount).toNumber() >= 0
  }
}
