import { Module } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { NotificationsRepository } from './notifications.repository';
import {
  NotificationSchema,
  NotificationSchemaFactory,
} from './notification.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NotificationSchema.name, schema: NotificationSchemaFactory },
    ]),
  ],
  providers: [NotificationsRepository, NotificationService, NotificationSchema],
  exports: [NotificationService],
})
export class NotificationsModule {}
