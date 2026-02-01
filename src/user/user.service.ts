import { ConflictException, Injectable } from "@nestjs/common"
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { IUserRepository } from './user-repository.interface';
import { PaginatedResponse } from 'src/common/common.dto';
import User from './user.entity';

@Injectable()
export class UserService {
	constructor(private readonly userRepository: IUserRepository) { }

	async getByLogin(login: string) {
		return this.userRepository.findUserByLogin(login)
	}

	async getById(id: number) {
		return this.userRepository.findUserById(id)
	}

	async getByRefreshToken(refreshToken: string) {
		return this.userRepository.findUserByRefreshToken(refreshToken)
	}

	async createNewUser(data: CreateUserDto) {
		const existingUser = await this.getByLogin(data.login)

		if (existingUser) {
			throw new ConflictException()
		}

		return this.userRepository.createUser(data)
	}

	async updateRefreshToken(userId: number, token: string) {
		return this.userRepository.updateToken(userId, token)
	}

	async getMe(id: number) {
		return this.userRepository.findUserById(id)
	}

	async getAllUsers(limit: number, page: number, includeDeleted: boolean = false): Promise<PaginatedResponse<Partial<User>>> {
		const response = await this.userRepository.findAllUsers(limit, page, includeDeleted)
		const [users, total] = response

		return {
			currentPage: page,
			data: users,
			limit,
			totalCount: total
		}
	}

	async deleteUser(id: number) {
		return this.userRepository.deleteUser(id)
	}

	async updateUser(id: number, data: UpdateUserDto) {
		return this.userRepository.updateUser(id, data)
	}
}
