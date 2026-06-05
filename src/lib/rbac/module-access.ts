import { can } from "@/lib/rbac/can";
import type { SelectedScope } from "@/types/hierarchy";
import type { ModuleKey } from "@/types/rbac";
import type { User } from "@/types/user";

const sidebarModules: ModuleKey[] = [
  "dashboard",
  "customers",
  "hierarchy",
  "devices",
  "configurations",
  "billing",
  "users",
  "administration",
];

export function getVisibleModules(
  user: User,
  selectedScope: SelectedScope | null,
): ModuleKey[] {
  return sidebarModules.filter((moduleKey) =>
    can(user, "view", moduleKey, selectedScope).allowed,
  );
}
