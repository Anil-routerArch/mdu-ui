import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UserStatus } from "@/types/user";

type UserStatusBadgeProps = {
  status: UserStatus;
};

const statusClassNames: Record<UserStatus, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  invited: "border-blue-200 bg-blue-50 text-blue-700",
  suspended: "border-rose-200 bg-rose-50 text-rose-700",
  password_reset_required: "border-amber-200 bg-amber-50 text-amber-700",
};

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn("capitalize", statusClassNames[status])}>
      {status.replaceAll("_", " ")}
    </Badge>
  );
}
