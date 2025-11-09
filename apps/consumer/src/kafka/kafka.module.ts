import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { LimitsModule } from 'src/limits/limits.module';

@Module({
  imports: [LimitsModule],
  providers: [KafkaService],
  exports: [KafkaService],
})
export class KafkaModule {}
