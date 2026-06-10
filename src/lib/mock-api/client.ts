import { findNodeById, isNodeWithinSubtree } from "@/lib/mock-data/hierarchy";
import { can } from "@/lib/rbac/can";
import { useMockRuntimeStore } from "@/stores/mock-runtime-store";
import type { ScopePathItem, SelectedScope } from "@/types/hierarchy";
import type { ModuleKey, PermissionAction } from "@/types/rbac";
import type { User } from "@/types/user";

export type MockApiErrorCode =
  | "BACKEND_UNAVAILABLE"
  | "MOCK_ERROR"
  | "NO_PERMISSION"
  | "NOT_FOUND"
  | "BILLING_CONFLICT";

export interface MockApiError extends Error {
  code: MockApiErrorCode;
  status: number;
  retryable: boolean;
  details?: unknown;
}

export function createMockApiError(
  code: MockApiErrorCode,
  message: string,
  options?: {
    status?: number;
    retryable?: boolean;
    details?: unknown;
  },
): MockApiError {
  const error = new Error(message) as MockApiError;
  error.code = code;
  error.status = options?.status ?? 500;
  error.retryable = options?.retryable ?? false;
  error.details = options?.details;
  return error;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function getRuntimeFlags() {
  return useMockRuntimeStore.getState();
}

export async function applyRuntimeDelay(): Promise<void> {
  const { artificialDelayMs } = getRuntimeFlags();
  await delay(artificialDelayMs);
}

export function maybeThrowBackendUnavailable(): void {
  const { forceBackendUnavailable } = getRuntimeFlags();

  if (forceBackendUnavailable) {
    throw createMockApiError(
      "BACKEND_UNAVAILABLE",
      "Mock backend is unavailable.",
      { status: 503, retryable: true },
    );
  }
}

export function maybeThrowMockError(): void {
  const { forceError } = getRuntimeFlags();

  if (forceError) {
    throw createMockApiError("MOCK_ERROR", "Mock API error triggered.", {
      status: 500,
      retryable: true,
    });
  }
}

export function maybeReturnEmpty<T>(data: T, emptyValue?: T): T {
  const { forceEmptyData } = getRuntimeFlags();

  if (!forceEmptyData) {
    return data;
  }

  if (emptyValue !== undefined) {
    return emptyValue;
  }

  if (Array.isArray(data)) {
    return [] as T;
  }

  return data;
}

export function toSelectedScope(scopeId: string | null | undefined): SelectedScope | null {
  if (!scopeId) {
    return null;
  }

  const node = findNodeById(scopeId);

  if (!node) {
    return null;
  }

  return {
    nodeId: node.id,
    nodeType: node.type,
    nodeName: node.name,
    path: node.path,
  };
}

export function assertCanAccess(
  user: User,
  action: PermissionAction,
  module: ModuleKey,
  scopeId?: string | null,
): void {
  const decision = can(user, action, module, toSelectedScope(scopeId));

  if (!decision.allowed) {
    throw createMockApiError(
      "NO_PERMISSION",
      decision.reason ?? "User is not allowed to access this resource.",
      { status: 403, retryable: false },
    );
  }
}

export function isPathWithinScope(
  path: ScopePathItem[],
  scopeId: string | null | undefined,
): boolean {
  if (!scopeId) {
    return true;
  }

  const targetId = path[path.length - 1]?.id;

  if (!targetId) {
    return false;
  }

  return isNodeWithinSubtree(targetId, scopeId);
}

export function isPathAccessibleToUser(path: ScopePathItem[], user: User): boolean {
  const targetId = path[path.length - 1]?.id;

  if (!targetId) {
    return false;
  }

  return user.scopeAssignments.some((assignment) => {
    const assignedScopeRoot = assignment.scopePath[assignment.scopePath.length - 1];

    if (!assignedScopeRoot) {
      return false;
    }

    return isNodeWithinSubtree(targetId, assignedScopeRoot.id);
  });
}

export function filterByScope<T>(
  items: T[],
  getPath: (item: T) => ScopePathItem[],
  scopeId: string | null | undefined,
  user?: User,
): T[] {
  return items.filter((item) => {
    const path = getPath(item);

    if (!isPathWithinScope(path, scopeId)) {
      return false;
    }

    if (user && !isPathAccessibleToUser(path, user)) {
      return false;
    }

    return true;
  });
}

export async function withMockApi<T>(executor: () => T | Promise<T>): Promise<T> {
  await applyRuntimeDelay();
  maybeThrowBackendUnavailable();
  maybeThrowMockError();
  return executor();
}
