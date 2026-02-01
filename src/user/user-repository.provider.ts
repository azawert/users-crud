import { Provider } from '@nestjs/common';
import { IUserRepository } from './user-repository.interface';
import { UserRepository } from './user.repository';

export const userRepositoryProvider: Provider = {
	provide: IUserRepository,
	useClass: UserRepository,
};