import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { Notification } from '../domain/notification';
import type { NotificationStorePort } from '../domain/ports/notification-store.port';
import {
  NotificationDocument,
  NotificationSchema,
} from './notification.schema';

@Injectable()
export class MongooseNotificationStore implements NotificationStorePort {
  constructor(
    @InjectModel(NotificationSchema.name)
    private readonly model: Model<NotificationDocument>,
  ) {}

  async save(notification: Notification): Promise<void> {
    await this.model.create(notification.toPersistence());
  }
}
