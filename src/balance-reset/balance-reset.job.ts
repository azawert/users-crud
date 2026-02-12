import { OnQueueActive, OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import type { Job } from 'bull'
import { IUserRepository } from 'src/user/user-repository.interface'
import { BALANCE_RESET_JOB_NAME, BALANCE_RESET_QUEUE_NAME } from './constants'
import { IBalanceResetJobPayload } from './types'

@Injectable()
@Processor(BALANCE_RESET_QUEUE_NAME)
export class BalanceResetJob {
  private readonly logger = new Logger(BalanceResetJob.name)

  constructor(private readonly userRepository: IUserRepository) {}

  @Process(BALANCE_RESET_JOB_NAME)
  async handle(job: Job<IBalanceResetJobPayload>) {
    this.logger.log(`Started balance reset job. id=${job.id}, source=${job.data.source}`)
    const affectedUsersCount = await this.userRepository.resetAllBalances()
    this.logger.log(`Completed balance reset job. id=${job.id}, affectedUsersCount=${affectedUsersCount}`)
    return {
      affectedUsersCount,
      source: job.data.source,
    }
  }

  @OnQueueActive()
  onQueueActive(job: Job<IBalanceResetJobPayload>) {
    this.logger.debug(`Queue active event. id=${job.id}, source=${job.data.source}`)
  }

  @OnQueueCompleted()
  onQueueCompleted(job: Job<IBalanceResetJobPayload>) {
    this.logger.debug(`Queue completed event. id=${job.id}, source=${job.data.source}`)
  }

  @OnQueueFailed()
  onQueueFailed(job: Job<IBalanceResetJobPayload> | undefined, error: Error) {
    this.logger.error(`Queue failed event. id=${job?.id ?? 'unknown'}`, error.stack)
  }
}
