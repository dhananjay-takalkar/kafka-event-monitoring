import type { EventMsg, LimitName } from '@event-monitoring/shared';

export interface LimitChecker {
  readonly name: string;
  readonly scope: string;
  check(event: EventMsg): Promise<LimitName | null> | LimitName | null;
}

export const LIMIT_CHECKERS = Symbol('LIMIT_CHECKERS');
