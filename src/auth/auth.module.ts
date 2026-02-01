import { ACCESS_TOKEN_SECRET_KEY } from './../common/constants';
import { Module } from "@nestjs/common"
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAccessStrategy } from './jwt-access.strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { JwtRefreshGuard } from './jwt-refresh.guard';
import { JwtAccessGuard } from './jwt-access.guard';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtAccessStrategy, JwtRefreshStrategy, JwtRefreshGuard, JwtAccessGuard],
  imports: [UserModule, ConfigModule, PassportModule, JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      global: true,
      secret: configService.get(ACCESS_TOKEN_SECRET_KEY)!,
      signOptions: { expiresIn: '40m' },
    }),
    inject: [ConfigService]
  }),
  ],

})
export class AuthModule { }
