import type { ID, ISODateTime, StatusSeverity } from "@/types/common";
import type { BillingPlanType, SubscriptionStatus } from "@/types/billing";
import type { ScopePathItem } from "@/types/hierarchy";

export interface DashboardKpi {
  key:
    | "sites"
    | "buildings"
    | "floors"
    | "venues"
    | "devices"
    | "alerts";
  label: string;
  value: number;
  delta: number;
  deltaLabel: string;
  severity: StatusSeverity;
}

export interface HealthSummary {
  totalDevices: number;
  online: number;
  warning: number;
  offline: number;
  unknown: number;
}

export interface RecentAlert {
  id: ID;
  severity: StatusSeverity;
  title: string;
  description: string;
  occurredAt: ISODateTime;
  scopePath: ScopePathItem[];
  resourceId?: ID;
  resourceLabel?: string;
}

export interface QuickAction {
  key:
    | "add_site"
    | "add_building"
    | "add_floor"
    | "add_venue"
    | "add_device"
    | "create_user"
    | "view_topology"
    | "run_diagnostics";
  label: string;
  description?: string;
}

export interface DashboardSummary {
  scopePath: ScopePathItem[];
  kpis: DashboardKpi[];
  health: HealthSummary;
  recentAlerts: RecentAlert[];
  quickActions: QuickAction[];
  billingSummary?: {
    currentPlanName: string | null;
    currentPlanType: BillingPlanType | null;
    subscriptionStatus: SubscriptionStatus | null;
  };
}
