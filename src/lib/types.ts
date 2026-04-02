export type ActionStatus = "OK" | "ERROR";

export interface ActionResponse<T> {
  status: ActionStatus;
  data?: T;
  success?: string;
  error?: string;
}
