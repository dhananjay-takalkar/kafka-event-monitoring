import { Inject, Injectable } from '@nestjs/common';
import type { Redis } from 'ioredis';

@Injectable()
export class LimitStateRepository {
  private static readonly USER_DELETE_TTL_SECONDS = 24 * 60 * 60; // 1 day

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  async incrementUserDeletes(userId: number): Promise<number> {
    const key = this.getDeletesKey(userId);
    const pipeline = this.redis
      .multi()
      .incr(key)
      .expire(key, LimitStateRepository.USER_DELETE_TTL_SECONDS, 'NX');
    const results = await pipeline.exec();
    const incrementResult = results?.[0]?.[1] ?? 0;
    return Number(incrementResult);
  }

  async pushUserUpdateTimestamp(
    userId: number,
    timestamp: number,
    windowMs: number,
  ): Promise<number> {
    const key = this.getUpdateKey(userId);
    const cutoff = timestamp - windowMs;
    const pipeline = this.redis
      .multi()
      .zremrangebyscore(key, 0, cutoff)
      .zadd(key, timestamp, timestamp.toString())
      .pexpire(key, windowMs)
      .zcard(key);

    const results = await pipeline.exec();
    const countResult = results?.[3]?.[1] ?? 0;
    return Number(countResult);
  }

  async resetUserDeletes(userId: number): Promise<void> {
    const key = this.getDeletesKey(userId);
    await this.redis.del(key);
  }

  private getDeletesKey(userId: number) {
    return `limit:3_user_deletes:${userId}`;
  }

  private getUpdateKey(userId: number) {
    return `limit:user_updates:${userId}`;
  }
}
