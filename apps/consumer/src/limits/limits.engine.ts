import { EventMsg } from '@event-monitoring/shared';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { LIMIT_CHECKERS, LimitChecker } from './limit-checkers';
import { NotificationService } from 'src/notifications/notifications.service';

@Injectable()
export class LimitsEngine implements OnModuleInit {
  constructor(
    @Inject(LIMIT_CHECKERS) private readonly checkers: LimitChecker[],
    private readonly notificationService: NotificationService,
  ) {}

  private readonly limitCheckers = new Map<string, LimitChecker>();
  onModuleInit(): void {
    for (const checker of this.checkers) {
      this.limitCheckers.set(checker.scope, checker);
    }
  }

  async handleEvent(event: EventMsg): Promise<void> {
    const checker = this.limitCheckers.get(event.scope);
    if (!checker) return;
    const result = await checker.check(event);
    console.log('result', result);
    if (result) {
      await this.notificationService.createNotification({
        userId: event.userId,
        date: event.date,
        limit: result,
      });
    }
  }
}
