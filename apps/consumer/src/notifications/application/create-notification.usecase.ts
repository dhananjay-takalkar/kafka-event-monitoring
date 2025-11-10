import { NotificationDTO } from '@event-monitoring/shared';
import { Inject, Injectable } from '@nestjs/common';
import { Notification } from '../domain/notification';
import { NOTIFICATION_STORE_PORT } from '../domain/ports/notification-store.port';
import type { NotificationStorePort } from '../domain/ports/notification-store.port';

@Injectable()
export class CreateNotificationUseCase {
  constructor(
    @Inject(NOTIFICATION_STORE_PORT)
    private readonly notificationStore: NotificationStorePort,
  ) {}

  async execute(dto: NotificationDTO): Promise<void> {
    const notification = Notification.create(dto);
    await this.notificationStore.save(notification);
  }
}
