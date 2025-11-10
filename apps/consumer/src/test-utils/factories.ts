import { EventMsg } from '@event-monitoring/shared';

export const createEvent = (overrides: Partial<EventMsg> = {}): EventMsg => ({
  userId: overrides.userId ?? 1,
  scope: overrides.scope ?? 'user.update',
  date: overrides.date ?? new Date().toISOString(),
});
