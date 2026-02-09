import { Module } from "@nestjs/common"
import { UserController } from "./user.controller"
import { UserService } from "./user.service"
import { userRepositoryProvider } from './user-repository.provider'

@Module({
	controllers: [UserController],
	providers: [UserService, userRepositoryProvider],
	exports: [UserService]
})
export class UserModule { }
