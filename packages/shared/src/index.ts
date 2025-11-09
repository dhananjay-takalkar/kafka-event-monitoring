export type Scope =
  | "user.create"
  | "user.read"
  | "user.update"
  | "user.delete"
  | "payment.create"
  | "payment.read"
  | "payment.update"
  | "payment.delete"
  | "top-secret.create"
  | "top-secret.read"
  | "top-secret.update"
  | "top-secret.delete";

export interface EventMsg {
  userId: number;
  scope: Scope;
  date: string; // ISO
}

export type LimitName =
  | "3_USER_DELETIONS"
  | "TOP_SECRET_READ"
  | "2_USER_UPDATED_IN_1MINUTE";

export interface NotificationDTO {
  userId: number;
  date: string; // ISO
  limit: LimitName;
}
