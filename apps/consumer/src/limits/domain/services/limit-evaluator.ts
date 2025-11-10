import { EventMsg, LimitName } from '@event-monitoring/shared';
import type { LimitChecker } from '../limit-checkers';

export class LimitEvaluator {
  private readonly limitCheckers = new Map<string, LimitChecker>();

  constructor(checkers: Iterable<LimitChecker>) {
    for (const checker of checkers) {
      this.limitCheckers.set(checker.name, checker);
    }
  }

  async evaluate(event: EventMsg): Promise<LimitName | null> {
    const scopeRoot = event.scope.split('.')[0];
    const checker = this.limitCheckers.get(scopeRoot);
    if (!checker) return null;
    return checker.check(event);
  }
}
