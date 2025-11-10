import { Injectable } from '@nestjs/common';
import { NotificationDTO } from '@event-monitoring/shared';
import { CreateNotificationUseCase } from 'src/notifications/application/create-notification.usecase';
import { NotificationPort } from '../domain/ports/notification.port';

@Injectable()
export class NotificationServiceAdapter implements NotificationPort {
  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase,
  ) {}

  async notifyLimitBreach(notification: NotificationDTO): Promise<void> {
    await this.createNotificationUseCase.execute(notification);
  }
}
