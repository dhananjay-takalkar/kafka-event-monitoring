import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLoggerService } from './common/logging/app-logger.service';
import { AppConfigService } from './common/config/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(AppLoggerService);
  app.useLogger(logger);

  const config = app.get(AppConfigService);
  const port = config.port;

  await app.listen(port);
  logger.log(`Consumer is running on port ${port}`, 'Bootstrap');
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
