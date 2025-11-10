import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreateNotificationUseCase } from '../application/create-notification.usecase';
import { NOTIFICATION_STORE_PORT } from '../domain/ports/notification-store.port';
import { MongooseNotificationStore } from './mongoose-notification.store';
import {
  NotificationSchema,
  NotificationSchemaFactory,
} from './notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NotificationSchema.name, schema: NotificationSchemaFactory },
    ]),
  ],
  providers: [
    CreateNotificationUseCase,
    MongooseNotificationStore,
    {
      provide: NOTIFICATION_STORE_PORT,
      useExisting: MongooseNotificationStore,
    },
  ],
  exports: [CreateNotificationUseCase],
})
export class NotificationsModule {}
