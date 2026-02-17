import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { initializeTransactionalContext } from 'typeorm-transactional'
import { AppModule } from './app.module'

async function bootstrap() {
  initializeTransactionalContext()

  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
