import type { ID, StatusSeverity } from "@/types/common";

export type SystemStateType =
  | "loading"
  | "empty"
  | "error"
  | "no_permission"
  | "backend_unavailable"
  | "partial_data"
  | "confirmation"
  | "success"
  | "read_only";

export interface SystemState {
  type: SystemStateType;
  title: string;
  message?: string;
}

export interface LoadingState extends SystemState {
  type: "loading";
  loadingLabel?: string;
}

export interface EmptyState extends SystemState {
  type: "empty";
  resourceLabel: string;
  canCreate: boolean;
}

export interface ErrorState extends SystemState {
  type: "error";
  severity: StatusSeverity;
  errorCode?: string;
  retryable: boolean;
}

export interface NoPermissionState extends SystemState {
  type: "no_permission";
  requiredAction?: string;
}

export interface BackendUnavailableState extends SystemState {
  type: "backend_unavailable";
  serviceName: string;
  retryable: boolean;
}

export interface PartialDataState extends SystemState {
  type: "partial_data";
  missingSections: string[];
}

export interface ConfirmationState extends SystemState {
  type: "confirmation";
  confirmationId: ID;
  confirmLabel: string;
  cancelLabel: string;
  severity: StatusSeverity;
}
