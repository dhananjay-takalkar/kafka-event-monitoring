import { EachBatchPayload, KafkaMessage } from 'kafkajs';
import { Inject, Injectable } from '@nestjs/common';
import { EVENT_PROCESSOR_PORT } from '../domain/ports/event-processor.port';
import type { EventProcessorPort } from '../domain/ports/event-processor.port';
import { AppLoggerService } from 'src/common/logging/app-logger.service';
import { EventMsg } from '@event-monitoring/shared';
import { AppConfigService } from 'src/common/config/app-config.service';

@Injectable()
export class ProcessBatchUseCase {
  private readonly messageConcurrency: number;

  constructor(
    @Inject(EVENT_PROCESSOR_PORT)
    private readonly eventProcessor: EventProcessorPort,
    private readonly logger: AppLoggerService,
    config: AppConfigService,
  ) {
    this.messageConcurrency = config.kafka.messageConcurrency;
  }

  async execute(payload: EachBatchPayload): Promise<void> {
    const { batch } = payload;
    if (!batch.messages.length) return;

    const concurrency = Math.max(
      Math.min(this.messageConcurrency, batch.messages.length),
      1,
    );

    for (let index = 0; index < batch.messages.length; index += concurrency) {
      const slice = batch.messages.slice(index, index + concurrency);
      await Promise.all(
        slice.map(async (message) => {
          if (!payload.isRunning() || payload.isStale()) {
            this.logger.warn(
              'Skipping message processing because consumer is stale',
              ProcessBatchUseCase.name,
            );
            return;
          }

          await this.handleMessage(message, payload);
        }),
      );
    }
  }

  private async handleMessage(
    message: KafkaMessage,
    payload: EachBatchPayload,
  ): Promise<void> {
    const raw = message.value?.toString();
    if (!raw) return;

    try {
      const event = this.parse(raw, message.offset);
      await this.eventProcessor.process(event);
      payload.resolveOffset(message.offset);
    } catch (error) {
      this.logger.error(
        `Error processing event at offset ${message.offset}`,
        error instanceof Error ? error.stack : undefined,
        ProcessBatchUseCase.name,
      );
      throw error;
    } finally {
      await payload.heartbeat();
    }
  }

  private parse(raw: string, offset: string): EventMsg {
    const parsed: unknown = JSON.parse(raw);
    const event = parsed as Partial<EventMsg>;
    if (
      typeof event?.userId !== 'number' ||
      typeof event?.scope !== 'string' ||
      typeof event?.date !== 'string'
    ) {
      throw new Error(`Invalid event payload at offset ${offset}`);
    }
    return event as EventMsg;
  }
}
