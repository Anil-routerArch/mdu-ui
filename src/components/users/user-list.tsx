"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

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
import { ROUTES } from "@/lib/constants/routes";
import { can } from "@/lib/rbac/can";
import type { SelectedScope } from "@/types/hierarchy";
import type { User } from "@/types/user";
import { AssignRoleProfileDialog } from "./assign-role-profile-dialog";
import { ResetPasswordConfirmation } from "./reset-password-confirmation";
import { SuspendUserConfirmation } from "./suspend-user-confirmation";
import { EditUserForm } from "./edit-user-form";
import { DeleteUserConfirmation } from "./delete-user-confirmation";
import { UserStatusBadge } from "./user-status-badge";

type UserListProps = {
  users: User[];
  currentUser: User;
  selectedScope: SelectedScope | null;
};

export function UserList({ users, currentUser, selectedScope }: UserListProps) {
  const [assignUser, setAssignUser] = useState<User | null>(null);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [suspendUser, setSuspendUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const editAllowed = useMemo(
    () => can(currentUser, "edit", "users", selectedScope).allowed,
    [currentUser, selectedScope],
  );
  const assignAllowed = useMemo(
    () => can(currentUser, "assign", "users", selectedScope).allowed,
    [currentUser, selectedScope],
  );

  return (
    <>
      <Card className="border border-slate-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role / Profile</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Scope</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-slate-900">{user.name}</TableCell>
                  <TableCell className="text-slate-700">{user.email}</TableCell>
                  <TableCell className="text-slate-700">
                    {user.profile.profileName ?? user.profile.role.replaceAll("_", " ")}
                  </TableCell>
                  <TableCell>
                    <UserStatusBadge status={user.status} />
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {user.scopeAssignments[0]?.scopePath.map((item) => item.name).join(" / ") ??
                      "No scope"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={ROUTES.userDetail(user.id)}>View Detail</Link>
                      </Button>
                      {editAllowed ? (
                        <Button type="button" variant="outline" size="sm" onClick={() => setEditUser(user)}>
                          Edit
                        </Button>
                      ) : null}
                      {assignAllowed ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setAssignUser(user)}
                        >
                          Assign Role / Profile
                        </Button>
                      ) : null}
                      {editAllowed ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setResetUser(user)}
                        >
                          Reset Password
                        </Button>
                      ) : null}
                      {editAllowed ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSuspendUser(user)}
                        >
                          {user.status === "suspended" ? "Reactivate" : "Suspend"}
                        </Button>
                      ) : null}
                      {editAllowed ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700"
                          onClick={() => setDeleteUser(user)}
                        >
                          Delete
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

      <EditUserForm
        user={editUser}
        currentUser={currentUser}
        open={Boolean(editUser)}
        onOpenChange={(open) => {
          if (!open) {
            setEditUser(null);
          }
        }}
      />

      <DeleteUserConfirmation
        user={deleteUser}
        currentUser={currentUser}
        open={Boolean(deleteUser)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteUser(null);
          }
        }}
      />

      <AssignRoleProfileDialog
        user={assignUser}
        currentUser={currentUser}
        open={Boolean(assignUser)}
        onOpenChange={(open) => {
          if (!open) {
            setAssignUser(null);
          }
        }}
      />

      <ResetPasswordConfirmation
        user={resetUser}
        currentUser={currentUser}
        open={Boolean(resetUser)}
        onOpenChange={(open) => {
          if (!open) {
            setResetUser(null);
          }
        }}
      />

      <SuspendUserConfirmation
        user={suspendUser}
        currentUser={currentUser}
        open={Boolean(suspendUser)}
        onOpenChange={(open) => {
          if (!open) {
            setSuspendUser(null);
          }
        }}
      />
    </>
  );
}
