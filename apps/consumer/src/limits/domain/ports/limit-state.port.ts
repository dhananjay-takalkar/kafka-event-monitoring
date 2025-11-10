export interface LimitStatePort {
  incrementUserDeletes(userId: number): Promise<number>;
  pushUserUpdateTimestamp(
    userId: number,
    timestamp: number,
    windowMs: number,
  ): Promise<number>;
  resetUserDeletes(userId: number): Promise<void>;
}

export const LIMIT_STATE_PORT = Symbol('LIMIT_STATE_PORT');
