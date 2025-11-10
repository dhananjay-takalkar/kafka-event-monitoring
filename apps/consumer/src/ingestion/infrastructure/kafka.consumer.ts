import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Consumer, EachBatchPayload } from 'kafkajs';
import { ProcessBatchUseCase } from '../application/process-batch.usecase';
import { AppConfigService } from 'src/common/config/app-config.service';
import { AppLoggerService } from 'src/common/logging/app-logger.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly kafka: Kafka;
  private readonly consumer: Consumer;
  private readonly topic: string;
  private readonly partitionsConcurrency: number;

  constructor(
    private readonly processBatchUseCase: ProcessBatchUseCase,
    private readonly config: AppConfigService,
    private readonly logger: AppLoggerService,
  ) {
    const kafkaConfig = config.kafka;

    this.kafka = new Kafka({
      clientId: kafkaConfig.clientId,
      brokers: kafkaConfig.brokers,
    });

    this.consumer = this.kafka.consumer({
      groupId: kafkaConfig.groupId,
      minBytes: 1,
    });

    this.topic = kafkaConfig.topic;
    this.partitionsConcurrency = kafkaConfig.partitionsConcurrency;
  }

  async onModuleInit(): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: this.topic });
    await this.consumer.run({
      eachBatchAutoResolve: false,
      partitionsConsumedConcurrently: this.partitionsConcurrency,
      eachBatch: async (payload) => this.handleBatch(payload),
    });

    this.logger.log(
      {
        message: 'Kafka consumer initialized',
        topic: this.topic,
      },
      KafkaConsumerService.name,
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.consumer.disconnect();
    this.logger.log('Kafka consumer disconnected', KafkaConsumerService.name);
  }

  private async handleBatch(payload: EachBatchPayload): Promise<void> {
    await this.processBatchUseCase.execute(payload);
    await payload.commitOffsetsIfNecessary();
  }
}
