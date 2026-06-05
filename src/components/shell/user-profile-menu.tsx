"use client";

import { ChevronDownIcon, LogOutIcon, UserCircle2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockUsers } from "@/lib/mock-data/users";
import { useAuthStore } from "@/stores/auth-store";

export function UserProfileMenu() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const switchRole = useAuthStore((state) => state.switchRole);
  const switchUser = useAuthStore((state) => state.switchUser);
  const logout = useAuthStore((state) => state.logout);

  if (!currentUser) {
    return null;
  }

  const scopeSummary =
    currentUser.scopeAssignments[0]?.scopePath.map((item) => item.name).join(" / ") ??
    "No assigned scope";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-12 rounded-2xl px-3 text-white hover:bg-white/10 hover:text-white"
        >
          <div className="mr-3 flex size-9 items-center justify-center rounded-full bg-white text-slate-900">
            <UserCircle2Icon className="size-5" />
          </div>
          <div className="hidden min-w-0 text-left sm:block">
            <div className="truncate text-sm font-medium">{currentUser.name}</div>
            <div className="truncate text-xs text-slate-300">
              {currentUser.profile.role}
            </div>
          </div>
          <ChevronDownIcon className="ml-2 size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="space-y-1 px-3 py-2">
          <p className="text-sm font-semibold text-slate-900">{currentUser.name}</p>
          <p className="text-xs text-slate-500">{currentUser.email}</p>
          <p className="text-xs text-slate-500">Role: {currentUser.profile.role}</p>
          <p className="text-xs text-slate-500">Scope: {scopeSummary}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
        {[
          "root_operator",
          "operator_admin",
          "customer_admin",
          "noc_support",
          "installer",
          "billing_admin",
          "read_only",
        ].map((role) => (
          <DropdownMenuItem key={role} onClick={() => switchRole(role as typeof currentUser.profile.role)}>
            {role}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Switch User</DropdownMenuLabel>
        {mockUsers.map((user) => (
          <DropdownMenuItem key={user.id} onClick={() => switchUser(user.id)}>
            {user.name}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          onClick={() => logout()}
        >
          <LogOutIcon className="mr-2 size-4" />
          Logout (Mock)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
