import { EventMsg } from '@event-monitoring/shared';
import { LimitChecker } from './limit-checkers';
import { Injectable } from '@nestjs/common';
import { LimitStateRepository } from './limit-state.repository';

@Injectable()
export class TopSecretReadChecker implements LimitChecker {
  readonly name = 'top-secret';
  readonly scope = 'top-secret.read';
  check(e: EventMsg) {
    return e.scope === this.scope ? 'TOP_SECRET_READ' : null;
  }
}

@Injectable()
export class UserCrudChecker implements LimitChecker {
  readonly name = 'user';
  readonly scope = 'user';
  private readonly userUpdateWindowMs = 60000;
  constructor(private readonly stateRepository: LimitStateRepository) {}
  async check(e: EventMsg) {
    if (!e.scope?.startsWith('user.')) return null;
    if (e.scope === 'user.delete') {
      const count = await this.stateRepository.incrementUserDeletes(e.userId);
      return count >= 3 ? '3_USER_DELETIONS' : null;
    } else {
      await this.stateRepository.resetUserDeletes(e.userId);
      if (e.scope === 'user.update') {
        const timestamp = new Date(e.date).getTime();
        if (Number.isNaN(timestamp)) return null;
        const windowSize = await this.stateRepository.pushUserUpdateTimestamp(
          e.userId,
          timestamp,
          this.userUpdateWindowMs,
        );
        return windowSize >= 2 ? `2_USER_UPDATED_IN_1MINUTE` : null;
      }
      return null;
    }
  }
}
