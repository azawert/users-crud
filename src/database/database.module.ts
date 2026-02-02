import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from 'src/user/user.entity';

const defaultRadix = 10

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				return {
					type: 'postgres',
					host: configService.get<string>('DB_HOST'),
					port: parseInt(configService.get<string>('DB_PORT') || '', defaultRadix),
					username: configService.get('DB_USERNAME'),
					password: configService.get('DB_PASSWORD'),
					database: configService.get('DB_NAME'),
					entities: [User],
					synchronize: true
				}
			}
		}),
	]
})

export class DatabaseModule { }