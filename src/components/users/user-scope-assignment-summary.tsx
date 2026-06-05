import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/types/user";

type UserScopeAssignmentSummaryProps = {
  user: User;
};

export function UserScopeAssignmentSummary({
  user,
}: UserScopeAssignmentSummaryProps) {
  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-slate-950">Scope Assignment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user.scopeAssignments.map((assignment) => (
          <div
            key={assignment.id}
            className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4 text-sm text-slate-700"
          >
            <p className="font-medium text-slate-900">
              {assignment.profileName ?? assignment.role.replaceAll("_", " ")}
            </p>
            <p className="mt-1 text-slate-600">
              {assignment.scopePath.map((item) => item.name).join(" / ")}
            </p>
            <div className="mt-3 space-y-1 text-xs text-slate-500">
              <p>Role: {assignment.role.replaceAll("_", " ")}</p>
              <p>Assigned at: {assignment.assignedAt}</p>
              <p>
                Permission summary: Scoped access is inherited from the assigned subtree and role
                profile.
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
