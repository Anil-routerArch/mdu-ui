import {
  assertCanAccess,
  createMockApiError,
  filterByScope,
  getRuntimeFlags,
  withMockApi,
} from "@/lib/mock-api/client";
import { findNodeById } from "@/lib/mock-data/hierarchy";
import {
  mockConfigurationAssignments,
  mockConfigurationSets,
} from "@/lib/mock-data/configurations";
import type {
  ConfigurationSet,
  ConfigurationValidationError,
  EffectiveConfigurationPreview,
} from "@/types/config";
import type { User } from "@/types/user";

export async function getConfigurations(
  scopeId: string,
  user: User,
): Promise<ConfigurationSet[]> {
  return withMockApi(() => {
    assertCanAccess(user, "view", "configurations", scopeId);
    return filterByScope(
      mockConfigurationSets,
      (config) => config.scopePath,
      scopeId,
      user,
    );
  });
}

export async function getConfigurationById(
  configId: string,
  user: User,
): Promise<ConfigurationSet> {
  return withMockApi(() => {
    const config = mockConfigurationSets.find((item) => item.id === configId);

    if (!config) {
      throw createMockApiError("NOT_FOUND", "Configuration not found.", {
        status: 404,
      });
    }

    assertCanAccess(user, "view", "configurations", config.scopePath[0]?.id ?? null);

    if (
      filterByScope([config], (item) => item.scopePath, null, user).length === 0
    ) {
      throw createMockApiError("NO_PERMISSION", "Configuration is outside scope.", {
        status: 403,
      });
    }

    return config;
  });
}

export async function getEffectiveConfigurationPreview(
  targetId: string,
  user: User,
): Promise<EffectiveConfigurationPreview> {
  return withMockApi(() => {
    const targetNode = findNodeById(targetId);

    if (!targetNode) {
      throw createMockApiError("NOT_FOUND", "Target node not found.", { status: 404 });
    }

    assertCanAccess(user, "view", "configurations", targetId);

    const assignments = mockConfigurationAssignments.filter((assignment) =>
      assignment.targetPath.some((item) => item.id === targetId),
    );

    const configIds = assignments.map((assignment) => assignment.configurationId);
    const { forcePartialData } = getRuntimeFlags();

    return {
      targetNodeId: targetNode.id,
      targetNodeType: targetNode.type,
      targetPath: targetNode.path,
      configurationIds: forcePartialData ? configIds.slice(0, 1) : configIds,
      effectiveValues: {
        ssid: "MDU-Guest",
        vlan: 120,
        captivePortalEnabled: true,
        bandSteeringEnabled: true,
      },
      overrideSources: {
        ssid: "Venue Lounge SSID Profile",
        vlan: "Floor 12 Core Network",
      },
    };
  });
}

export async function validateConfigurationDraft(draft: {
  name?: string;
  scopeId?: string;
  values?: Record<string, unknown>;
}): Promise<ConfigurationValidationError[]> {
  return withMockApi(() => {
    const errors: ConfigurationValidationError[] = [];

    if (!draft.name?.trim()) {
      errors.push({
        code: "NAME_REQUIRED",
        field: "name",
        message: "Configuration name is required.",
        severity: "error",
      });
    }

    if (!draft.scopeId) {
      errors.push({
        code: "SCOPE_REQUIRED",
        field: "scopeId",
        message: "Target scope is required.",
        severity: "error",
      });
    }

    if (draft.values && Object.keys(draft.values).length === 0) {
      errors.push({
        code: "VALUES_EMPTY",
        field: "values",
        message: "At least one configuration value is required.",
        severity: "warning",
      });
    }

    return errors;
  });
}
