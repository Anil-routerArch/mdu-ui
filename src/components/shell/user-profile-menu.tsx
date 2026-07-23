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
import { useState, useEffect } from "react";
import { ACCENT_THEMES, applyAccentTheme } from "@/lib/theme-utils";

export function UserProfileMenu() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const switchRole = useAuthStore((state) => state.switchRole);
  const switchUser = useAuthStore((state) => state.switchUser);
  const logout = useAuthStore((state) => state.logout);
  const [activeTheme, setActiveTheme] = useState("blue");

  useEffect(() => {
    const storedAccent = window.localStorage.getItem("mdu-ui-accent") || "blue";
    setActiveTheme(storedAccent);
  }, []);

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
          className="h-9 rounded-xl px-2.5 text-white hover:bg-white/10 hover:text-white"
        >
          <div className="mr-2.5 flex size-7 items-center justify-center rounded-full bg-white text-[var(--mdu-text-strong)]">
            <UserCircle2Icon className="size-4" />
          </div>
          <div className="hidden min-w-0 text-left sm:block">
            <div className="truncate text-xs font-medium">{currentUser.name}</div>
            <div className="truncate text-[11px] text-blue-100/80">
              {currentUser.profile.role}
            </div>
          </div>
          <ChevronDownIcon className="ml-1.5 size-3.5" />
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
        <DropdownMenuLabel>MDU Theme Accent</DropdownMenuLabel>
        <div className="flex flex-wrap items-center gap-3 px-3 py-2">
          {Object.keys(ACCENT_THEMES).map((themeName) => {
            const isSelected = activeTheme === themeName;
            const themeColors = ACCENT_THEMES[themeName];
            return (
              <button
                key={themeName}
                type="button"
                className={`h-6 w-6 rounded-full border-2 transition-all hover:scale-110 active:scale-95 ${
                  isSelected ? "border-slate-800 dark:border-slate-100 scale-105" : "border-slate-200 dark:border-slate-700"
                }`}
                style={{ backgroundColor: themeColors.light["--mdu-primary"] }}
                onClick={() => {
                  setActiveTheme(themeName);
                  applyAccentTheme(themeName);
                  window.localStorage.setItem("mdu-ui-accent", themeName);
                }}
                title={themeName.charAt(0).toUpperCase() + themeName.slice(1)}
              />
            );
          })}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
        {[
          "root",
          "system",
          "admin",
          "noc",
          "installer",
          "accounting",
          "csr",
        ].map((role) => (
          <DropdownMenuItem key={role} onClick={() => switchRole(role as any)}>
            {role === "noc" ? "NOC" : role === "csr" ? "CSR" : role.charAt(0).toUpperCase() + role.slice(1)}
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
