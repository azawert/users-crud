import { InjectQueue } from '@nestjs/bull'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import type { Queue } from 'bull'
import {
  BALANCE_RESET_JOB_NAME,
  BALANCE_RESET_QUEUE_NAME,
  BALANCE_RESET_REPEATABLE_JOB_ID,
  TEN_MINUTES_IN_MS,
} from './constants'
import { IBalanceResetJobPayload } from './types'

@Injectable()
export class BalanceResetService implements OnModuleInit {
  private readonly logger = new Logger(BalanceResetService.name)

  constructor(@InjectQueue(BALANCE_RESET_QUEUE_NAME) private readonly queue: Queue<IBalanceResetJobPayload>) {}

  async onModuleInit() {
    this.logger.log('Balance reset module initialization started')
    await this.ensureRepeatableResetJob()
    this.logger.log('Balance reset module initialization finished')
  }

  async enqueueManualBalanceReset() {
    this.logger.log('Manual balance reset requested')
    const job = await this.queue.add(
      BALANCE_RESET_JOB_NAME,
      {
        requestedAt: new Date().toISOString(),
        source: 'manual',
      },
      {
        attempts: 3,
        backoff: {
          delay: 1000,
          type: 'fixed',
        },
        removeOnComplete: true,
        removeOnFail: 100,
      },
    )
    this.logger.debug(`Manual balance reset has been queued. id=${job.id}`)

    return {
      jobId: job.id,
      status: 'queued',
    }
  }

  private async ensureRepeatableResetJob() {
    this.logger.debug('Ensuring repeatable balance reset job is scheduled')
    const repeatableJob = await this.queue.add(
      BALANCE_RESET_JOB_NAME,
      {
        requestedAt: new Date().toISOString(),
        source: 'schedule',
      },
      {
        jobId: BALANCE_RESET_REPEATABLE_JOB_ID,
        removeOnComplete: true,
        removeOnFail: 100,
        repeat: {
          every: TEN_MINUTES_IN_MS,
        },
      },
    )
    this.logger.log(`Repeatable balance reset job has been ensured. id=${repeatableJob.id}`)
  }
}
