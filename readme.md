# Event Monitoring

This project captures kafka events, events are evaluated based on user activity against some limits and if those limits are exceeded it stores notifications in mongoDB. The workspace is organised as a pnpm turborepo monorepo.

- `apps/consumer`: a NestJS worker that ingests events, applies limit logic, and stores notifications.
- `packages/shared`: shared TypeScript contracts (`EventMsg`, `NotificationDTO`, `LimitName`) consumed by the worker.

## Repository Layout

```
.
├── apps/
│   └── consumer/
│       ├── src/
│       │   ├── common/          # app-wide config + logging modules
│       │   ├── ingestion/       # Kafka consumer, batch processing use case
│       │   ├── limits/          # limit evaluation domain + Redis adapters
│       │   ├── notifications/   # notification domain + Mongo adapters
│       │   ├── redis/           # global Redis provider
│       │   └── kafka/           # Nest module bundling ingestion
│       ├── dist/                # compiled output
│       └── test/                # Nest e2e scaffolding
├── packages/
│   └── shared/                  # re-usable DTO/types package
├── docker-compose.yml           # Kafka stack for local development
├── pnpm-workspace.yaml          # workspace package discovery
└── turbo.json                   # Turborepo pipeline configuration
```

## Service Architecture

The consumer service follows a layered (hexagonal) structure to keep framework concerns away from business rules:

- **Entry point**: `main.ts` bootstraps Nest, wires the custom JSON logger (`AppLoggerService`), and listens on the configured port.
- **Ingestion**:
  - `KafkaConsumerService` wraps `kafkajs`, subscribes to the configured topic, and streams batches into the application layer.
  - `ProcessBatchUseCase` validates messages, honours concurrency limits from configuration, and forwards each event through `EVENT_PROCESSOR_PORT`.
- **Limits**:
  - `ProcessEventUseCase` implements `EventProcessorPort`, composes a `LimitEvaluator`, and coordinates downstream notifications.
  - `LimitEvaluator` maps an event’s scope to the right `LimitChecker` (e.g. `TopSecretReadChecker`, `UserCrudChecker`).
  - `RedisLimitStateRepository` provides persistence for counters/sliding windows through `LIMIT_STATE_PORT`.
  - `NotificationServiceAdapter` bridges limit breaches to the notifications module via `LIMIT_NOTIFICATION_PORT`.
- **Notifications**:
  - `Notification` entity validates invariants before persistence.
  - `CreateNotificationUseCase` builds the entity and stores it through the `NOTIFICATION_STORE_PORT`.
  - `MongooseNotificationStore` implements the store port using the schema defined in `notification.schema.ts`.
- **Cross-cutting modules**:
  - `AppConfigModule` exposes validated configuration values.
  - `LoggingModule` registers the JSON logger.
  - `RedisModule` provides a global Redis client and gracefully closes connections.
  - `KafkaModule` bundles `IngestionModule` so other modules can import Kafka capabilities without tight coupling.

## Event Flow

1. `KafkaConsumerService` receives batches from the configured topic (`config.kafka.topic`) and hands each batch to `ProcessBatchUseCase`.
2. `ProcessBatchUseCase` parses each message into an `EventMsg`, invokes the `ProcessEventUseCase`, and resolves offsets on success while heartbeating the consumer.
3. `ProcessEventUseCase` runs the event through `LimitEvaluator`. If no checker reports a limit, processing stops.
4. When a limit is returned, `ProcessEventUseCase` calls `LIMIT_NOTIFICATION_PORT` with the user, date, and limit name.
5. `NotificationServiceAdapter` delegates to `CreateNotificationUseCase`, which persists a MongoDB document via `MongooseNotificationStore`.

Redis holds transient state for delete counts and sliding windows; MongoDB stores durable notification history. Logging happens through `AppLoggerService`, emitting structured JSON to stdout.

## Configuration

Environment variables are supplied via `@nestjs/config`. Place a `.env` file in the repository root or `apps/consumer`—values are merged and defaulted by `AppConfigService`.

| Variable                             | Default                                      | Description                                |
| ------------------------------------ | -------------------------------------------- | ------------------------------------------ |
| `PORT`                               | `3000`                                       | HTTP port for health endpoints.            |
| `MONGODB_URI`                        | `mongodb://localhost:27017/event-monitoring` | Mongo connection string.                   |
| `REDIS_URL`                          | `redis://localhost:6379`                     | Redis instance for limit state.            |
| `KAFKA_CLIENT`                       | `test-producer`                              | Kafka client id.                           |
| `KAFKA_BROKERS` / `KAFKA_BROKER_URL` | `localhost:9092`                             | Comma-separated broker list.               |
| `KAFKA_GROUP`                        | `limits-group`                               | Kafka consumer group id.                   |
| `KAFKA_TOPIC`                        | `system.events`                              | Kafka topic to consume.                    |
| `KAFKA_MESSAGE_CONCURRENCY`          | `5`                                          | Max concurrent message handlers per batch. |
| `KAFKA_PARTITIONS_CONCURRENCY`       | `1`                                          | Max partitions consumed in parallel.       |

## Local Development

### Prerequisites

- Node.js ≥ 20
- PNPM ≥ 9
- Docker (for the Kafka stack in `docker-compose.yml`)
- Redis & MongoDB (provide externally or run in your own containers)

### Install workspace dependencies

```bash
pnpm install
```

### Start Kafka tooling

```bash
# Starts Kafka broker + kafka-ui
pnpm docker:up
```

> Redis and MongoDB are **not** defined in `docker-compose.yml`; launch them separately.

### Run the consumer service

```bash
# Watch mode with hot reload
pnpm consumer:dev

# Production build & start
pnpm --filter consumer build
pnpm --filter consumer start:prod
```

### Testing

Unit tests live next to the code in `__tests__` directories (e.g. `limits/domain/services/__tests__/limit-evaluator.spec.ts`). Run the suite with:

```bash
pnpm consumer:test
```

`apps/consumer/package.json` also exposes `test:watch`, `test:cov`, and other Jest helpers.

## Turborepo Tasks

- `pnpm test` → `turbo run test` for all packages.
- `pnpm dev` → parallel dev servers/watchers.
- `pnpm build` → compiles packages using `turbo run build`.

Turborepo caching emits warnings if no outputs are declared; adjust `turbo.json` when adding new build artifacts.

## Extending the System

- **New limits**: implement a `LimitChecker`, register it in `LimitsModule`, and add companion tests under `limits/domain`.
- **Alternative notification sinks**: implement `NOTIFICATION_STORE_PORT` (e.g. publish to Kafka, send emails) and swap the provider in `NotificationsModule`.
- **Additional processors**: create a new class implementing `EventProcessorPort` and rebind `EVENT_PROCESSOR_PORT` in `IngestionModule`.
- **Shared contracts**: update `packages/shared` and run its TypeScript build to propagate type changes.

## Troubleshooting

- **Kafka connection errors**: verify `KAFKA_BROKERS`, ensure the topic exists, and consult the Kafka UI at `http://localhost:8080`.
- **Redis state issues**: check connectivity and confirm TTL/window settings in `RedisLimitStateRepository` meet your limit requirements.
- **Mongo validation errors**: ensure events include ISO dates and valid `LimitName` values before persisting.
- **Turborepo cache warnings**: define outputs in `turbo.json` for tasks that emit artifacts.

For further questions or contributions, open an issue or submit a pull request.
