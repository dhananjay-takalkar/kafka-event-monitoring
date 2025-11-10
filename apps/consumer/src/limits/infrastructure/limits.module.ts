import { Module } from '@nestjs/common';
import { NotificationsModule } from 'src/notifications/infrastructure/notifications.module';
import { ProcessEventUseCase } from '../application/process-event.usecase';
import { TopSecretReadChecker, UserCrudChecker } from '../domain/limits';
import { LIMIT_CHECKERS } from '../domain/limit-checkers';
import { LIMIT_NOTIFICATION_PORT } from '../domain/ports/notification.port';
import { LIMIT_STATE_PORT } from '../domain/ports/limit-state.port';
import { NotificationServiceAdapter } from './notification.service.adapter';
import { RedisLimitStateRepository } from './redis-limit-state.repository';

@Module({
  imports: [NotificationsModule],
  providers: [
    ProcessEventUseCase,
    TopSecretReadChecker,
    UserCrudChecker,
    RedisLimitStateRepository,
    NotificationServiceAdapter,
    {
      provide: LIMIT_CHECKERS,
      useFactory: (
        topSecret: TopSecretReadChecker,
        userCrud: UserCrudChecker,
      ) => [topSecret, userCrud],
      inject: [TopSecretReadChecker, UserCrudChecker],
    },
    {
      provide: LIMIT_STATE_PORT,
      useExisting: RedisLimitStateRepository,
    },
    {
      provide: LIMIT_NOTIFICATION_PORT,
      useExisting: NotificationServiceAdapter,
    },
  ],
  exports: [ProcessEventUseCase],
})
export class LimitsModule {}
