import { Global, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('REDIS_URL') || 'redis://localhost:6379';
        return new Redis(url, {
          maxRetriesPerRequest: 3,
        });
      },
    },
    {
      provide: 'REDIS_DISCONNECT',
      inject: ['REDIS_CLIENT'],
      useFactory: (client: Redis): OnModuleDestroy => ({
        async onModuleDestroy() {
          await client.quit();
        },
      }),
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
