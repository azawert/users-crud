import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { TConfigService } from 'src/common'
import { userRepositoryProvider } from 'src/user/providers/user-repository.provider'
import { BalanceResetController } from './balance-reset.controller'
import { BalanceResetJob } from './balance-reset.job'
import { BalanceResetService } from './balance-reset.service'
import { BALANCE_RESET_QUEUE_NAME } from './constants'

const defaultRedisPort = 6379
const defaultRedisHost = 'localhost'

@Module({
  controllers: [BalanceResetController],
  imports: [
    BullModule.forRootAsync({
      useFactory: (configService: TConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST') || defaultRedisHost,
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
