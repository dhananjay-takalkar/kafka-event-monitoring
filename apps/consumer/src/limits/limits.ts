import { EventMsg } from '@event-monitoring/shared';
import { LimitChecker } from './limit-checkers';

export class TopSecretReadChecker implements LimitChecker {
  readonly name = 'TOP_SECRET_READ' as const;
  readonly scope = 'top-secret.read';
  check(e: EventMsg) {
    return e.scope === this.scope ? this.name : null;
  }
}

export class ThreeUserDeletesChecker implements LimitChecker {
  readonly name = '3_USER_DELETIONS' as const;
  private streak = new Map<number, number>();
  readonly scope = 'user.delete';
  check(e: EventMsg) {
    if (e.scope !== this.scope) return null;
    const prev = this.streak.get(e.userId) ?? 0;
    const next = prev + 1;
    this.streak.set(e.userId, next);
    return next >= 3 ? this.name : null;
  }
}

export class TwoUserUpdatesInMinuteChecker implements LimitChecker {
  readonly name = '2_USER_UPDATED_IN_1MINUTE' as const;
  private updates = new Map<number, number[]>(); // timestamps
  readonly scope = 'user.update';
  check(e: EventMsg) {
    const now = new Date(e.date).getTime();
    if (e.scope !== this.scope) return null;
    const arr = (this.updates.get(e.userId) ?? []).filter(
      (t) => now - t < 60000,
    );
    arr.push(now);
    this.updates.set(e.userId, arr);
    return arr.length >= 2 ? this.name : null;
  }
}
