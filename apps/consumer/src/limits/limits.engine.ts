import { EventMsg, LimitName } from '@event-monitoring/shared';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { LIMIT_CHECKERS, LimitChecker } from './limit-checkers';
import { NotificationService } from 'src/notifications/notifications.service';
import { LimitStateRepository } from './limit-state.repository';

@Injectable()
export class LimitsEngine implements OnModuleInit {
  constructor(
    @Inject(LIMIT_CHECKERS) private readonly checkers: LimitChecker[],
    private readonly notificationService: NotificationService,
    private readonly limitStateRepository: LimitStateRepository,
  ) {}

  private readonly limitCheckers = new Map<string, LimitChecker>();
  onModuleInit(): void {
    for (const checker of this.checkers) {
      this.limitCheckers.set(checker.name, checker);
    }
  }

  async handleEvent(event: EventMsg): Promise<void> {
    console.log('event', event);
    const checker = this.limitCheckers.get(event.scope.split('.')[0]);
    if (!checker) return;
    const result: LimitName | null = await checker.check(event);
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
