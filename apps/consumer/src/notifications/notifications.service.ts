import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import { NotificationDocument } from './notification.schema';
import { NotificationDTO } from '@event-monitoring/shared';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async createNotification(
    notification: NotificationDTO,
  ): Promise<NotificationDocument> {
    return this.notificationsRepository.save(notification);
  }
}
