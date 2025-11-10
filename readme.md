# Event Monitoring

Event Monitoring ingests high-volume Kafka event streams, evaluates user activity against configurable limits, and records notifications when thresholds are exceeded. The workspace is organised as a PNPM/Turborepo monorepo with the `consumer` NestJS service and shared TypeScript contracts.

## System Architecture

- **Bounded contexts**:
  - `ingestion` handles Kafka connectivity, batching, and back-pressure aware message dispatch.
  - `limits` evaluates domain rules (user delete counts, rapid updates, sensitive reads) and coordinates stateful repositories.
  - `notifications` persists limit breach events via MongoDB.
  - `packages/shared` exposes DTOs used across services.
- **Layered design**: each context follows `domain` (entities, value objects, ports) → `application` (use cases) → `infrastructure` (Nest providers, adapters) separation to keep business rules isolated from frameworks.
- **Cross-cutting modules**:
  - `AppConfigModule` centralises typed configuration and defaults.
  - `GlobalExceptionFilter` unifies error responses and logging for application-level failures.
- **Runtime flow**: Kafka batches enter `ProcessBatchUseCase`, which emits each message to `ProcessEventUseCase`. Domain limit checkers use Redis-backed counters and rolling windows. When a breach is detected, the notifications port emits a `NotificationDTO` to the Mongo-backed store. All outbound side effects (Redis, Mongo, notification store) are accessed through ports so adapters can be swapped or tested in isolation.
- **Data & messaging**:
  - **Kafka**: primary ingestion channel (`system.events` topic by default).
  - **Redis**: fast state for limit counters and rolling windows.
  - **MongoDB**: durable storage for notifications.
  - Defaults target local instances but can be overridden via environment variables.

## Setup & Local Development

- **Prerequisites**: Node.js ≥ 20, PNPM ≥ 9, Docker (for Kafka stack), and local Redis + MongoDB instances (containerised or managed).
- **Install dependencies**:
  ```bash
  pnpm install
  ```
- **Environment variables**: create `.env` files in the repo root or `apps/consumer` (loaded by `@nestjs/config`). Key settings and defaults:

| Variable                             | Default                                      | Description                                |
| ------------------------------------ | -------------------------------------------- | ------------------------------------------ |
| `PORT`                               | `3000`                                       | HTTP port for health and diagnostics.      |
| `MONGODB_URI`                        | `mongodb://localhost:27017/event-monitoring` | Mongo connection string for notifications. |
| `REDIS_URL`                          | `redis://localhost:6379`                     | Redis instance used for limit state.       |
| `KAFKA_CLIENT`                       | `test-producer`                              | Kafka client id for the consumer.          |
| `KAFKA_BROKERS` / `KAFKA_BROKER_URL` | `localhost:9092`                             | Comma-separated broker list.               |
| `KAFKA_GROUP`                        | `limits-group`                               | Consumer group id.                         |
| `KAFKA_TOPIC`                        | `system.events`                              | Topic processed by the consumer.           |
| `KAFKA_MESSAGE_CONCURRENCY`          | `5`                                          | Max concurrent message handlers per batch. |
| `KAFKA_PARTITIONS_CONCURRENCY`       | `1`                                          | Max partitions processed in parallel.      |

- **Start local infrastructure**:

  ```bash
  # Kafka + UI (Zookeeper, broker, kafka-ui)
  pnpm docker:up
  ```

  > Redis and MongoDB are not defined in `docker-compose.yml`.

- **Run the consumer service**:
  ```bash
  # Watch mode
  pnpm consumer:dev
  # Production build
  pnpm --filter consumer build
  pnpm --filter consumer start:prod
  ```

## Infrastructure & Deployment

- **Observability**: application and infrastructure layers emit JSON logs suitable for structured processors; asynchronous worker logs originate from the domain use cases and adapters.
- **External dependencies**:
  - Kafka broker reachable by the service (`KAFKA_BROKERS`).
  - Redis cache with low-latency network path to honour concurrency settings.
  - MongoDB replicaset or managed cluster for notification persistence.
  - Optional Kafka UI (`localhost:8080`) for inspecting topics during development.
- **Scaling guidance**: increase `KAFKA_MESSAGE_CONCURRENCY` and `KAFKA_PARTITIONS_CONCURRENCY` to parallelise processing, ensure Redis TTL settings are tuned if limits require different sliding windows.
