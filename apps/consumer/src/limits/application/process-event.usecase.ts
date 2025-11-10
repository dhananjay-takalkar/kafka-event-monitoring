import { EventMsg } from '@event-monitoring/shared';
import { Inject, Injectable } from '@nestjs/common';
import type { EventProcessorPort } from 'src/ingestion/domain/ports/event-processor.port';
import type { LimitChecker } from '../domain/limit-checkers';
import { LIMIT_CHECKERS } from '../domain/limit-checkers';
import { LIMIT_NOTIFICATION_PORT } from '../domain/ports/notification.port';
import type { NotificationPort } from '../domain/ports/notification.port';
import { LimitEvaluator } from '../domain/services/limit-evaluator';

@Injectable()
export class ProcessEventUseCase implements EventProcessorPort {
  private readonly limitEvaluator: LimitEvaluator;

  constructor(
    @Inject(LIMIT_CHECKERS) checkers: LimitChecker[],
    @Inject(LIMIT_NOTIFICATION_PORT)
    private readonly notificationPort: NotificationPort,
  ) {
    this.limitEvaluator = new LimitEvaluator(checkers);
  }

  async process(event: EventMsg): Promise<void> {
    const result = await this.limitEvaluator.evaluate(event);
    if (!result) return;

    await this.notificationPort.notifyLimitBreach({
      userId: event.userId,
      date: event.date,
      limit: result,
    });
  }
}
