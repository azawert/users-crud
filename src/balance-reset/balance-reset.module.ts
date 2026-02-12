import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { userRepositoryProvider } from 'src/user/providers/user-repository.provider'
import { BalanceResetController } from './balance-reset.controller'
import { BalanceResetJob } from './balance-reset.job'
import { BalanceResetService } from './balance-reset.service'
import { BALANCE_RESET_QUEUE_NAME } from './constants'

const defaultRedisPort = 6379

@Module({
  controllers: [BalanceResetController],
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST') || '127.0.0.1',
          password: configService.get<string>('REDIS_PASSWORD'),
          port: Number(configService.get<string>('REDIS_PORT') || defaultRedisPort),
        },
      }),
    }),
    BullModule.registerQueue({
      name: BALANCE_RESET_QUEUE_NAME,
    }),
  ],
  providers: [BalanceResetJob, BalanceResetService, userRepositoryProvider],
})
export class BalanceResetModule {}
