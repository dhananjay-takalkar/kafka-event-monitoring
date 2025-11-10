import type { Notification } from '../notification';

export interface NotificationStorePort {
  save(notification: Notification): Promise<void>;
}

export const NOTIFICATION_STORE_PORT = Symbol('NOTIFICATION_STORE_PORT');
