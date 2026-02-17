import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import Decimal from 'decimal.js'
import { BaseRepository } from 'src/base'
import { ACTIVE_USERS_PHOTO_COUNT } from 'src/common/constants'
import { Photo } from 'src/photo/photo.entity'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { CreateUserDto, MostActiveUserRequestDto, UpdateUserDto } from './dto/user.dto'
import User from './user.entity'
import { IUserRepository } from './user-repository.interface'

const propertiesToSelect: Record<keyof User, boolean> = {
  age: true,
  balance: true,
  createdAt: false,
  deletedAt: false,
  description: true,
  email: true,
  id: true,
  login: true,
  passwordHash: true,
  photos: true,
  refreshToken: true,
  role: true,
  updatedAt: false,
}

@Injectable()
export class UserRepository extends BaseRepository implements IUserRepository {
  private readonly logger = new Logger(UserRepository.name)
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource)
  }
  private userRepository(entityManager?: EntityManager): Repository<User> {
    return this.getRepository(User, entityManager)
  }

  async findUserById(id: number): Promise<User | null> {
    try {
      return this.userRepository().findOne({
        select: propertiesToSelect,
        where: {
          id,
        },
      })
    } catch (e) {
      throw new BadGatewayException(e)
    }
  }

  async findUserByLogin(login: string): Promise<User | null> {
    try {
      return this.userRepository().findOne({ select: propertiesToSelect, where: { login } })
    } catch (e) {
      throw new BadGatewayException(e)
    }
  }

  async createUser(data: CreateUserDto): Promise<User> {
    const { password, ...rest } = data
    return this.userRepository().save({ passwordHash: password, ...rest })
  }

  async updateToken(userId: number, token: string): Promise<{ ok: boolean }> {
    try {
      await this.userRepository().update(
        { id: userId },
        {
          refreshToken: token,
        },
      )
      return {
        ok: true,
      }
    } catch (_error) {
      return {
        ok: false,
      }
    }
  }

  async findUserByRefreshToken(refreshToken: string): Promise<User | null> {
    try {
      return this.userRepository().findOne({ select: propertiesToSelect, where: { refreshToken } })
    } catch (e) {
      throw new BadGatewayException(e)
    }
  }

  async findAllUsers(limit: number = 10, page: number = 1, includeDeleted: boolean = false): Promise<[User[], number]> {
    const skip = (page - 1) * limit
    try {
      return this.userRepository().findAndCount({
        select: propertiesToSelect,
        skip,
        take: limit,
        withDeleted: includeDeleted,
      })
    } catch (e) {
      throw new InternalServerErrorException(e)
    }
  }

  async updateUser(userId: number, data: UpdateUserDto): Promise<User | null> {
    const { ...updateData } = { ...data }
    try {
      await this.userRepository().update({ id: userId }, updateData)

      const newUser = await this.findUserById(userId)

      return newUser
    } catch (e) {
      throw new InternalServerErrorException(e)
    }
  }

  async deleteUser(userId: number): Promise<void> {
    await this.userRepository().softDelete({ id: userId })
  }

  async getMostActiveUsers(params: MostActiveUserRequestDto): Promise<User[] | undefined> {
    const { maxAge, minAge } = params
    try {
      const users = await this.userRepository()
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.photos', 'photo')
        .where(qb => {
          const subQuery = qb
            .subQuery()
            .select('p.userId')
            .from(Photo, 'p')
            .groupBy('p.userId')
            .having('COUNT(p.id) > :count')
            .getQuery()

          return 'user.id IN (' + subQuery + ')'
        })
        .setParameter('count', ACTIVE_USERS_PHOTO_COUNT)
        .andWhere('user.description IS NOT NULL')
        .andWhere('user.age >= :minAge', { minAge })
        .andWhere('user.age <= :maxAge', { maxAge })
        .getMany()

      return users
    } catch (e) {
      this.logger.error(`Error while fetching users with avatar. Error: ${e}`)
      if (e instanceof HttpException) {
        const status = e.getStatus()
        const message = e.message

        throw new HttpException(message, status)
      }
    }
  }

  async transferBalance(payerId: number, payeeId: number, amount: Decimal): Promise<void> {
    try {
      await this.dataSource.transaction(async manager => {
        const [firstId, secondId] = payerId < payeeId ? [payerId, payeeId] : [payeeId, payerId]
        const lockedUsers = await this.userRepository(manager)
          .createQueryBuilder('user')
          .setLock('pessimistic_write')
          .where('user.id IN (:...ids)', { ids: [firstId, secondId] })
          .getMany()

        if (lockedUsers.length !== 2) {
          throw new NotFoundException('Payer or payee user not found')
        }

        const firstUser = lockedUsers.find(user => user.id === firstId)
        const secondUser = lockedUsers.find(user => user.id === secondId)
        if (!firstUser || !secondUser) {
          throw new InternalServerErrorException('Locked users mismatch during transfer')
        }

        const payer = payerId === firstId ? firstUser : secondUser
        const payee = payeeId === firstId ? firstUser : secondUser
        const payerBalance = new Decimal(payer.balance)
        const payeeBalance = new Decimal(payee.balance)

        if (payerBalance.lessThan(amount)) {
          throw new BadRequestException('Insufficient payer balance')
        }

        await this.userRepository(manager).save([
          { ...payer, balance: payerBalance.minus(amount) },
          { ...payee, balance: payeeBalance.plus(amount) },
        ])
      })
    } catch (e) {
      this.logger.error('Error while transferring balance', e)
      if (e instanceof HttpException) {
        throw e
      }
      throw new InternalServerErrorException(e)
    }
  }

  async resetAllBalances(): Promise<number> {
    try {
      this.logger.log('Starting bulk balance reset for all users')
      const result = await this.userRepository()
        .createQueryBuilder()
        .update(User)
        .set({ balance: new Decimal(0) })
        .execute()
      const affectedRows = result.affected ?? 0
      this.logger.log(`Bulk balance reset finished. Affected users count: ${affectedRows}`)
      return affectedRows
    } catch (e) {
      this.logger.error('Error while resetting balances for all users', e)
      throw new InternalServerErrorException(e)
    }
  }
}
