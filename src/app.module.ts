import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { DatabaseModule } from './database/database.module'
import { UserModule } from './user/user.module'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, DatabaseModule, UserModule],
})
export class AppModule {}
