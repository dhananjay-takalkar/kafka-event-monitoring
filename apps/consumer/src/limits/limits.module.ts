import { Module } from '@nestjs/common';
import { LimitsEngine } from './limits.engine';
import { TopSecretReadChecker, UserCrudChecker } from './limits';
import { LIMIT_CHECKERS } from './limit-checkers';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { LimitStateRepository } from './limit-state.repository';

@Module({
  imports: [NotificationsModule],
  providers: [
    LimitsEngine,
    TopSecretReadChecker,
    UserCrudChecker,
    LimitStateRepository,
    {
      provide: LIMIT_CHECKERS,
      useFactory: (
        topSecret: TopSecretReadChecker,
        userCrud: UserCrudChecker,
      ) => [topSecret, userCrud],
      inject: [TopSecretReadChecker, UserCrudChecker],
    },
  ],
  exports: [LimitsEngine],
})
export class LimitsModule {}
