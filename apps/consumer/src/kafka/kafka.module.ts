import { Module } from '@nestjs/common';
import { IngestionModule } from 'src/ingestion/ingestion.module';

@Module({
  imports: [IngestionModule],
})
export class KafkaModule {}
