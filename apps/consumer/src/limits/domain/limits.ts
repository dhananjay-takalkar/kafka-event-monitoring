import { Inject, Injectable } from '@nestjs/common';
import { EventMsg } from '@event-monitoring/shared';
import { LimitChecker } from './limit-checkers';
import { LIMIT_STATE_PORT } from './ports/limit-state.port';
import type { LimitStatePort } from './ports/limit-state.port';

@Injectable()
export class TopSecretReadChecker implements LimitChecker {
  readonly name = 'top-secret';
  readonly scope = 'top-secret.read';
  check(event: EventMsg) {
    return event.scope === this.scope ? 'TOP_SECRET_READ' : null;
  }
}

@Injectable()
export class UserCrudChecker implements LimitChecker {
  readonly name = 'user';
  readonly scope = 'user';
  private readonly userUpdateWindowMs = 60000;
  constructor(
    @Inject(LIMIT_STATE_PORT)
    private readonly stateRepository: LimitStatePort,
  ) {}
  async check(event: EventMsg) {
    if (!event.scope?.startsWith('user.')) return null;
    if (event.scope === 'user.delete') {
      const count = await this.stateRepository.incrementUserDeletes(
        event.userId,
      );
      return count >= 3 ? '3_USER_DELETIONS' : null;
    } else {
      await this.stateRepository.resetUserDeletes(event.userId);
      if (event.scope === 'user.update') {
        const timestamp = new Date(event.date).getTime();
        if (Number.isNaN(timestamp)) return null;
        const windowSize = await this.stateRepository.pushUserUpdateTimestamp(
          event.userId,
          timestamp,
          this.userUpdateWindowMs,
        );
        return windowSize >= 2 ? `2_USER_UPDATED_IN_1MINUTE` : null;
      }
      return null;
    }
  }
}
