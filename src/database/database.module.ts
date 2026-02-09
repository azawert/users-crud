import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import User from 'src/user/user.entity'

const defaultRadix = 10

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          database: configService.get('DB_NAME'),
          entities: [User],
          host: configService.get<string>('DB_HOST'),
          password: configService.get('DB_PASSWORD'),
          port: parseInt(configService.get<string>('DB_PORT') || '', defaultRadix),
          synchronize: true,
          type: 'postgres',
          username: configService.get('DB_USERNAME'),
        }
      },
    }),
  ],
})
export class DatabaseModule {}
