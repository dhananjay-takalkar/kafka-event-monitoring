import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface KafkaConfig {
  clientId: string;
  brokers: string[];
  groupId: string;
  topic: string;
  messageConcurrency: number;
  partitionsConcurrency: number;
}

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get port(): number {
    return this.getNumber('PORT', 3000);
  }

  get mongoUri(): string {
    return this.configService.get<string>('MONGODB_URI') ?? '';
  }

  get kafka(): KafkaConfig {
    return {
      clientId: this.getString('KAFKA_CLIENT', 'test-producer'),
      brokers: this.getKafkaBrokers(),
      groupId: this.getString('KAFKA_GROUP', 'limits-group'),
      topic: this.getString('KAFKA_TOPIC', 'system.events'),
      messageConcurrency: this.getNumber('KAFKA_MESSAGE_CONCURRENCY', 5, {
        min: 1,
      }),
      partitionsConcurrency: this.getNumber('KAFKA_PARTITIONS_CONCURRENCY', 1, {
        min: 1,
      }),
    };
  }

  private getString(key: string, defaultValue: string): string {
    const value = this.configService.get<string>(key);
    return value?.trim().length ? value : defaultValue;
  }

  private getNumber(
    key: string,
    defaultValue: number,
    options?: { min?: number; max?: number },
  ): number {
    const raw = this.configService.get<string | number>(key);
    const parsed =
      typeof raw === 'number' ? raw : raw ? Number.parseInt(raw, 10) : NaN;
    if (Number.isNaN(parsed)) return defaultValue;

    const bounded = Math.max(
      options?.min ?? Number.NEGATIVE_INFINITY,
      Math.min(parsed, options?.max ?? Number.POSITIVE_INFINITY),
    );
    return bounded;
  }

  private getKafkaBrokers(): string[] {
    const list =
      this.configService.get<string>('KAFKA_BROKERS') ??
      this.configService.get<string>('KAFKA_BROKER_URL');
    if (!list) return [];
    return list
      .split(',')
      .map((broker) => broker.trim())
      .filter(Boolean);
  }
}
