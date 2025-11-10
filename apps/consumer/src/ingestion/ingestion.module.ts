import { Module } from '@nestjs/common';
import { AppConfigModule } from 'src/common/config/app-config.module';
import { LoggingModule } from 'src/common/logging/logging.module';
import { LimitsModule } from 'src/limits/infrastructure/limits.module';
import { ProcessBatchUseCase } from './application/process-batch.usecase';
import { EVENT_PROCESSOR_PORT } from './domain/ports/event-processor.port';
import { KafkaConsumerService } from './infrastructure/kafka.consumer';
import { ProcessEventUseCase } from 'src/limits/application/process-event.usecase';

@Module({
  imports: [AppConfigModule, LoggingModule, LimitsModule],
  providers: [
    ProcessBatchUseCase,
    KafkaConsumerService,
    {
      provide: EVENT_PROCESSOR_PORT,
      useExisting: ProcessEventUseCase,
    },
  ],
  exports: [KafkaConsumerService],
})
export class IngestionModule {}
