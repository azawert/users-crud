import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TConfigService } from 'src/common'
import { UserModule } from 'src/user/user.module'
import { ACCESS_TOKEN_EXPIRES_IN, ACCESS_TOKEN_SECRET_KEY } from './../common/constants'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtAccessGuard } from './guards/jwt-access.guard'
import { JwtRefreshGuard } from './guards/jwt-refresh.guard'
import { JwtAccessStrategy } from './strategies/jwt-access.strategy'
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy'

@Module({
  controllers: [AuthController],
  imports: [
    UserModule,
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: TConfigService) => ({
        global: true,
        secret: configService.getOrThrow(ACCESS_TOKEN_SECRET_KEY),
        signOptions: { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
      }),
    }),
  ],
  providers: [AuthService, JwtAccessStrategy, JwtRefreshStrategy, JwtRefreshGuard, JwtAccessGuard],
})
export class AuthModule {}
