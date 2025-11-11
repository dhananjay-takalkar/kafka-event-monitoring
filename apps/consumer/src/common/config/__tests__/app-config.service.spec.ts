import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from '../app-config.service';
import { Test } from '@nestjs/testing';
// import { join } from 'path';

describe('AppConfigService', () => {
  let service: AppConfigService;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: 'env.example',
          //   isGlobal: true,
        }),
      ],
      providers: [AppConfigService],
    }).compile();

    service = moduleRef.get(AppConfigService);
  });
  it('should return the port', () => {
    expect(service.port).not.toBeUndefined();
    expect(service.port).not.toBeNull();
  });
  it('should return the mongoUri', () => {
    expect(service.mongoUri).not.toBeUndefined();
    expect(service.mongoUri).not.toBeNull();
    expect(service.mongoUri).not.toBe('');
  });
  it('should return the kafka', () => {
    const kafka = service.kafka;
    expect(kafka).not.toBeUndefined();
    expect(kafka).not.toBeNull();

    expect(kafka.clientId).toBeDefined();
    expect(kafka.brokers).toBeDefined();
    expect(Array.isArray(kafka.brokers)).toBe(true);
    expect(kafka.brokers.length).toBeGreaterThan(0);
    expect(kafka.groupId).toBeDefined();
    expect(kafka.topic).toBeDefined();
    expect(kafka.messageConcurrency).toBeDefined();
    expect(kafka.partitionsConcurrency).toBeDefined();
  });
});
