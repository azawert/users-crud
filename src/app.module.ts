import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { BalanceResetModule } from './balance-reset/balance-reset.module'
import { DatabaseModule } from './database/database.module'
import { PhotoModule } from './photo/photo.module'
import { FilesModule } from './providers/files.module'
import { RedisModule } from './providers/redis/redis.module'
import { S3Module } from './providers/s3/s3.module'
import { UserModule } from './user/user.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    BalanceResetModule,
    DatabaseModule,
    UserModule,
    S3Module,
    FilesModule,
    PhotoModule,
    RedisModule,
  ],
})
export class AppModule {}
