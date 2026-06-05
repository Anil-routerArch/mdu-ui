"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { rolePermissionMatrix } from "@/lib/rbac/permissions";
import type { RoleProfile, UserRole } from "@/types/rbac";
import type { User } from "@/types/user";
import { AdminStatusBadge } from "./admin-status-badge";
import { EditRolePolicyDialog } from "./edit-role-policy-dialog";

type RolesAndPoliciesProps = {
  profiles: RoleProfile[];
  currentUser: User;
  canEdit?: boolean;
};

function summarizeModules(profile: RoleProfile) {
  return Array.from(new Set(profile.rules.map((rule) => rule.module))).join(", ");
}

function inferProfileStatus(role: UserRole) {
  return rolePermissionMatrix[role].modules.administration.visible ? "active" : "restricted";
}

export function RolesAndPolicies({
  profiles,
  currentUser,
  canEdit = false,
}: RolesAndPoliciesProps) {
  const [selectedProfile, setSelectedProfile] = useState<RoleProfile | null>(profiles[0] ?? null);
  const [editProfile, setEditProfile] = useState<RoleProfile | null>(null);

  const userCountByRole = useMemo(() => {
    const role = currentUser.profile.role;
    return Object.fromEntries(
      profiles.map((profile) => [profile.role, profile.role === role ? 1 : 0]),
    ) as Record<UserRole, number>;
  }, [currentUser.profile.role, profiles]);

  return (
    <>
      <Card className="border border-slate-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Roles and Policies</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profile</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Module Access</TableHead>
                <TableHead>User Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium text-slate-900">{profile.name}</TableCell>
                  <TableCell className="text-slate-700">{profile.description ?? "No description"}</TableCell>
                  <TableCell className="text-slate-700">{summarizeModules(profile) || "No module summary"}</TableCell>
                  <TableCell className="text-slate-700">{userCountByRole[profile.role] ?? 0}</TableCell>
                  <TableCell>
                    <AdminStatusBadge status={inferProfileStatus(profile.role)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProfile(profile)}
                      >
                        View
                      </Button>
                      {canEdit ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditProfile(profile)}
                        >
                          Edit
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedProfile ? (
        <Card className="border border-slate-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-slate-950">Policy Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <p><span className="text-slate-500">Profile:</span> {selectedProfile.name}</p>
            <p><span className="text-slate-500">Role:</span> {selectedProfile.role.replaceAll("_", " ")}</p>
            <p><span className="text-slate-500">Summary:</span> {selectedProfile.description ?? "No description"}</p>
            <p>
              <span className="text-slate-500">Business-facing access:</span>{" "}
              {summarizeModules(selectedProfile) || "No visible modules"}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <EditRolePolicyDialog
        profile={editProfile}
        open={Boolean(editProfile)}
        onOpenChange={(open) => {
          if (!open) {
            setEditProfile(null);
          }
        }}
      />
    </>
  );
}
