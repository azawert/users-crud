import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TConfigService } from 'src/common'
import { Photo } from 'src/photo/photo.entity'
import User from 'src/user/user.entity'
import { DataSource } from 'typeorm'
import { addTransactionalDataSource } from 'typeorm-transactional'

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
        } catch (_error) {
          return dataSource
        }
      },
      imports: [ConfigModule],
      useFactory: (configService: TConfigService) => ({
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
