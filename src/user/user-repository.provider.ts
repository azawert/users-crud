import { Provider } from '@nestjs/common'
import { UserRepository } from './user.repository'
import { IUserRepository } from './user-repository.interface'

export const userRepositoryProvider: Provider = {
  provide: IUserRepository,
  useClass: UserRepository,
}
