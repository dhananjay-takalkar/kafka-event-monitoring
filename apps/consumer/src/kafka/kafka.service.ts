import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { EachBatchPayload, Kafka, KafkaMessage } from 'kafkajs';
import { EventMsg } from '@event-monitoring/shared';
import { LimitsEngine } from 'src/limits/limits.engine';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly limitsEngine: LimitsEngine) {}
  private readonly logger = new Logger(KafkaService.name);

  private readonly kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT || 'event-monitoring-consumer',
    brokers: [process.env.KAFKA_BROKER_URL ?? 'localhost:9092'],
  });

  private consumer = this.kafka.consumer({
    groupId: process.env.KAFKA_GROUP ?? 'event-monitoring-consumer-group',
    minBytes: 1,
  });

  private readonly messageConcurrency = Math.max(
    Number(process.env.KAFKA_MESSAGE_CONCURRENCY ?? 5),
    1,
  );

  async onModuleInit() {
    await this.consumer.connect();
    const topic = process.env.KAFKA_TOPIC ?? '';
    await this.consumer.subscribe({ topic: topic });
    await this.consumer.run({
      eachBatchAutoResolve: false,
      partitionsConsumedConcurrently: Math.max(
        Number(process.env.KAFKA_PARTITIONS_CONCURRENCY ?? 1),
        1,
      ),
      eachBatch: async (payload) => this.handleBatch(payload),
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }

  private async handleBatch(payload: EachBatchPayload) {
    const { batch } = payload;
    if (!batch.messages.length) return;
    const concurrency = Math.min(
      this.messageConcurrency,
      batch.messages.length,
    );

    for (let index = 0; index < batch.messages.length; index += concurrency) {
      const slice = batch.messages.slice(index, index + concurrency);
      await Promise.all(
        slice.map(async (message) => {
          if (!payload.isRunning() || payload.isStale()) {
            return;
          }
          await this.processMessage(message, () => payload.heartbeat());
          payload.resolveOffset(message.offset);
        }),
      );
    }

    await payload.commitOffsetsIfNecessary();
    await payload.heartbeat();
  }

  private async processMessage(
    message: KafkaMessage,
    heartbeat: () => Promise<void>,
  ) {
    const raw = message.value?.toString();
    if (!raw) return;

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!this.isEventMsg(parsed)) {
        this.logger.warn(`Skipping invalid payload: ${raw}`);
        return;
      }
      await this.limitsEngine.handleEvent(parsed);
    } catch (error) {
      this.logger.error(
        `Error processing event at offset ${message.offset}: ${error}`,
      );
      throw error;
    } finally {
      await heartbeat();
    }
  }

  private isEventMsg(x: unknown): x is EventMsg {
    if (!x || typeof x !== 'object') return false;
    const o = x as Record<string, unknown>;
    return (
      typeof o.userId === 'number' &&
      typeof o.scope === 'string' &&
      typeof o.date === 'string'
    );
  }
}
