import { Module } from '@nestjs/common';
import { LimitsEngine } from './limits.engine';
import {
  ThreeUserDeletesChecker,
  TopSecretReadChecker,
  TwoUserUpdatesInMinuteChecker,
} from './limits';
import { LIMIT_CHECKERS } from './limit-checkers';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [
    LimitsEngine,
    TopSecretReadChecker,
    ThreeUserDeletesChecker,
    TwoUserUpdatesInMinuteChecker,
    {
      provide: LIMIT_CHECKERS,
      useFactory: (
        topSecret: TopSecretReadChecker,
        threeUserDeletes: ThreeUserDeletesChecker,
        twoUserUpdatesInMinute: TwoUserUpdatesInMinuteChecker,
      ) => [topSecret, threeUserDeletes, twoUserUpdatesInMinute],
      inject: [
        TopSecretReadChecker,
        ThreeUserDeletesChecker,
        TwoUserUpdatesInMinuteChecker,
      ],
    },
  ],
  exports: [LimitsEngine],
})
export class LimitsModule {}
