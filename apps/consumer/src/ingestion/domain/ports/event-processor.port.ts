import { EventMsg } from '@event-monitoring/shared';

export interface EventProcessorPort {
  process(event: EventMsg): Promise<void>;
}

export const EVENT_PROCESSOR_PORT = Symbol('EVENT_PROCESSOR_PORT');
