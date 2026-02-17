import { Injectable, Logger } from '@nestjs/common'
import Redis, { Redis as RedisClient } from 'ioredis'
import { DEFAULT_RADIX, DEFAULT_TTL_IN_SECONDS, type TConfigService } from 'src/common'

@Injectable()
export class RedisService {
  private client: RedisClient
  private readonly logger: Logger = new Logger(RedisService.name)

  constructor(private readonly configService: TConfigService) {
    this.client = new Redis({
      host: '127.0.0.1',
      password: this.configService.getOrThrow<string>('REDIS_PASSWORD'),
      port: parseInt(this.configService.getOrThrow<string>('REDIS_PORT'), DEFAULT_RADIX),
    })
  }

  public async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key)

    if (data) {
      try {
        const parsed = JSON.parse(data)
        this.logger.log(`Cache hit. Retrieve data from key:${key}. data: ${data}`)
        return parsed
      } catch (e) {
        this.logger.error(`Error while parsing data from redis. Error: ${e}`)
        throw e
      }
    }
    this.logger.debug(`Cache miss. Missed key: ${key}`)
    return null
  }

  public async set<T>(key: string, value: T, ttlSeconds = DEFAULT_TTL_IN_SECONDS) {
    const stringifiedData = JSON.stringify(value)

    await this.client.set(key, stringifiedData, 'EX', ttlSeconds)
  }

  public async delete(key: string) {
    await this.client.del(key)
  }
}
