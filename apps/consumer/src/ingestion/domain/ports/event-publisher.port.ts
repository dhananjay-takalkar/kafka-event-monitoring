export interface EventPublisherPort<TEvent = unknown> {
  publish(event: TEvent): Promise<void>;
}

export const EVENT_PUBLISHER_PORT = Symbol('EVENT_PUBLISHER_PORT');
