import { Module } from '@nestjs/common'
import { userRepositoryProvider } from './providers/user-repository.provider'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  controllers: [UserController],
  exports: [UserService],
  providers: [UserService, userRepositoryProvider],
})
export class UserModule {}
