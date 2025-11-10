import type { LimitName } from '@event-monitoring/shared';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'notifications',
})
export class NotificationSchema {
  @Prop({ required: true })
  userId: number;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  limit: LimitName;
}

export type NotificationDocument = HydratedDocument<NotificationSchema>;

export const NotificationSchemaFactory =
  SchemaFactory.createForClass(NotificationSchema);

NotificationSchemaFactory.index({ userId: 1, createdAt: -1 });
NotificationSchemaFactory.index({ limit: 1, createdAt: -1 });
