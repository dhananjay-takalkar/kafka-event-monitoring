// apps/consumer/src/limits/limit-checker.ts
import type { EventMsg, LimitName } from '@event-monitoring/shared';
//EventType
export interface LimitChecker {
  readonly name: any;
  readonly scope: string;
  check(
    event: EventMsg,
    // now: number,
  ): Promise<LimitName | null> | LimitName | null;
}

export const LIMIT_CHECKERS = Symbol('LIMIT_CHECKERS'); // multi-provider token
