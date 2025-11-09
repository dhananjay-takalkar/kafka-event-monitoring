import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  NotificationDocument,
  NotificationSchema,
} from './notification.schema';
import { Model } from 'mongoose';
import { NotificationDTO } from '@event-monitoring/shared';

@Injectable()
export class NotificationsRepository {
  constructor(
    @InjectModel(NotificationSchema.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}
  async save(notification: NotificationDTO): Promise<NotificationDocument> {
    return this.notificationModel.create(notification);
  }
}
