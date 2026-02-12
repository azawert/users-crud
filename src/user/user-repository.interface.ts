import { CreateUserDto, MostActiveUserRequestDto, UpdateUserDto } from './dto/user.dto'
import User from './user.entity'

export abstract class IUserRepository {
  abstract findUserById(id: number): Promise<User | null>
  abstract findUserByLogin(login: string): Promise<User | null>
  abstract createUser(data: CreateUserDto): Promise<User>
  abstract updateToken(userId: number, token: string): Promise<{ ok: boolean }>
  abstract findUserByRefreshToken(refreshToken: string): Promise<User | null>
  abstract findAllUsers(limit: number, page: number, includeDeleted?: boolean): Promise<[User[], number]>
  abstract updateUser(userId: number, data: UpdateUserDto): Promise<User | null>
  abstract deleteUser(userId: number): Promise<void>
  abstract getMostActiveUsers(params: MostActiveUserRequestDto): Promise<User[] | undefined>
}
