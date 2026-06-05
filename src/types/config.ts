import type { ID, ISODateTime } from "@/types/common";
import type { ScopePathItem } from "@/types/hierarchy";

export interface ConfigurationVersion {
  id: ID;
  version: number;
  changeSummary: string;
  createdAt: ISODateTime;
  createdByUserId: ID;
}

export interface ConfigurationSet {
  id: ID;
  name: string;
  description?: string;
  scopePath: ScopePathItem[];
  status: "draft" | "active" | "archived";
  currentVersion: ConfigurationVersion;
  assignmentCount: number;
  updatedAt: ISODateTime;
}

export interface ConfigurationAssignment {
  id: ID;
  configurationId: ID;
  targetNodeId: ID;
  targetNodeType: ScopePathItem["type"];
  targetPath: ScopePathItem[];
  assignedAt: ISODateTime;
}

export interface EffectiveConfigurationPreview {
  targetNodeId: ID;
  targetNodeType: ScopePathItem["type"];
  targetPath: ScopePathItem[];
  configurationIds: ID[];
  effectiveValues: Record<string, string | number | boolean | null>;
  overrideSources: Record<string, string>;
}

export interface ConfigurationValidationError {
  code: string;
  field: string;
  message: string;
  severity: "error" | "warning";
}
