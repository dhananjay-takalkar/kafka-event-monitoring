import { LimitName } from '@event-monitoring/shared';

export interface NotificationProps {
  userId: number;
  date: string;
  limit: LimitName;
}

export class Notification {
  private constructor(private readonly props: NotificationProps) {}

  static create(props: NotificationProps): Notification {
    if (!Number.isInteger(props.userId) || props.userId < 0) {
      throw new Error('Notification userId must be a non-negative integer.');
    }

    const timestamp = Date.parse(props.date);
    if (Number.isNaN(timestamp)) {
      throw new Error('Notification date must be a valid ISO string.');
    }

    if (!props.limit) {
      throw new Error('Notification limit must be defined.');
    }

    return new Notification({
      ...props,
      date: new Date(timestamp).toISOString(),
    });
  }

  toPersistence(): NotificationProps {
    return { ...this.props };
  }
}
