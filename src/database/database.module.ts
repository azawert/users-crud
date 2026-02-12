import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Photo } from 'src/photo/photo.entity'
import User from 'src/user/user.entity'
import { DataSource } from 'typeorm'
import { addTransactionalDataSource } from 'typeorm-transactional'

const defaultRadix = 10

// database.module.ts
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      dataSourceFactory: async options => {
        if (!options) {
          throw new Error('Invalid options passed')
        }

        const dataSource = new DataSource(options)
        await dataSource.initialize()

        try {
          return addTransactionalDataSource(dataSource)
        } catch (error) {
          return dataSource
        }
      },
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        database: configService.get('DB_NAME'),
        entities: [User, Photo],
        host: configService.get('DB_HOST'),
        password: configService.get('DB_PASSWORD'),
        port: parseInt(configService.get('DB_PORT') || '5432', 10),
        synchronize: true,
        type: 'postgres',
        username: configService.get('DB_USERNAME'),
      }),
    }),
  ],
})
export class DatabaseModule {}
