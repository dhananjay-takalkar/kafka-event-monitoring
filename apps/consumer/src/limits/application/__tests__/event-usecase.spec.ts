import { ProcessEventUseCase } from '../process-event.usecase';
import type { NotificationPort } from '../../domain/ports/notification.port';
import type { EventMsg } from '@event-monitoring/shared';

describe('ProcessEventUseCase', () => {
  let useCase: ProcessEventUseCase;
  let checker: { name: string; scope: string; check: jest.Mock };
  let notificationPort: { notifyLimitBreach: jest.Mock };
  const event: EventMsg = {
    userId: 42,
    scope: 'user.update',
    date: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    checker = {
      name: 'user',
      scope: 'user',
      check: jest.fn().mockResolvedValue(null),
    };

    notificationPort = {
      notifyLimitBreach: jest.fn().mockResolvedValue(undefined),
    };

    useCase = new ProcessEventUseCase(
      [checker],
      notificationPort as NotificationPort,
    );
  });

  it('does not send a notification when no limit is breached', async () => {
    await useCase.process(event);

    expect(checker.check).toHaveBeenCalledWith(event);
    expect(notificationPort.notifyLimitBreach).not.toHaveBeenCalled();
  });

  it('sends a notification when a limit is returned by the evaluator', async () => {
    checker.check.mockResolvedValueOnce('TOP_SECRET_READ');

    await useCase.process(event);

    expect(notificationPort.notifyLimitBreach).toHaveBeenCalledWith({
      userId: event.userId,
      date: event.date,
      limit: 'TOP_SECRET_READ',
    });
  });
});
