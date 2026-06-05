"use client";

import { mockUsers, mockUsersById } from "@/lib/mock-data/users";
import type { UserRole } from "@/types/rbac";
import type { User } from "@/types/user";
import { create } from "zustand";

type AuthStoreState = {
  currentUser: User | null;
  currentRole: UserRole | null;
  isAuthenticated: boolean;
  loginAsUser: (userId: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
};

function getDefaultUser(): User {
  // TODO: Replace this temporary development-only default session with real
  // OWSEC/auth enforcement when authentication is implemented.
  return (
    mockUsers.find((user) => user.profile.role === "operator_admin") ?? mockUsers[0]
  );
}

function toAuthState(user: User | null) {
  return {
    currentUser: user,
    currentRole: user?.profile.role ?? null,
    isAuthenticated: Boolean(user),
  };
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  ...toAuthState(getDefaultUser()),
  loginAsUser: (userId) => {
    const user = mockUsersById[userId] ?? null;

    set(() => toAuthState(user));
  },
  logout: () => {
    set(() => toAuthState(null));
  },
  switchRole: (role) => {
    const user = mockUsers.find((item) => item.profile.role === role) ?? null;

    set(() => toAuthState(user));
  },
  switchUser: (userId) => {
    const user = mockUsersById[userId] ?? null;

    set(() => toAuthState(user));
  },
}));
