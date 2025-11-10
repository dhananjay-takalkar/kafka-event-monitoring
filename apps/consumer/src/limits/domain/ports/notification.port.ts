import { NotificationDTO } from '@event-monitoring/shared';

export interface NotificationPort {
  notifyLimitBreach(notification: NotificationDTO): Promise<void>;
}

export const LIMIT_NOTIFICATION_PORT = Symbol('LIMIT_NOTIFICATION_PORT');
