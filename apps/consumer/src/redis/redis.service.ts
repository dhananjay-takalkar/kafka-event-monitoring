import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}
  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }
  async set(key: string, value: string): Promise<void> {
    await this.redis.set(key, value);
  }
  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
