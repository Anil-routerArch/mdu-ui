"use client";

import { hierarchyExampleIds, getScopePath } from "@/lib/mock-data/hierarchy";
import { mockUsers, mockUsersById } from "@/lib/mock-data/users";
import type { UserRole } from "@/types/rbac";
import type { User } from "@/types/user";
import { create } from "zustand";

const OWSEC_URL = process.env.NEXT_PUBLIC_OWSEC_URL || "https://openwifi3.routerarchitects.com:16001";

type AuthStoreState = {
  currentUser: User | null;
  currentRole: UserRole | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  initialize: () => Promise<void>;
  loginAsUser: (email: string, password?: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
};

function getRoleDisplayName(role: UserRole): string {
  const r = role.toLowerCase();
  if (r === "noc") return "NOC";
  if (r === "csr") return "CSR";
  return r.charAt(0).toUpperCase() + r.slice(1);
}

function mapBackendRole(backendRole: string): UserRole {
  const role = backendRole.toLowerCase();
  if (role === "root") return "root";
  if (role === "admin") return "admin";
  if (role === "noc") return "noc";
  if (role === "installer") return "installer";
  if (role === "accounting") return "accounting";
  if (role === "csr") return "csr";
  if (role === "system") return "system";
  return "csr";
}

function getScopeForRole(role: UserRole) {
  if (role === "noc") {
    return getScopePath(hierarchyExampleIds.SUNRISE_TOWERS_ID);
  }
  if (role === "installer") {
    return getScopePath(hierarchyExampleIds.FLOOR_12_ID);
  }
  return getScopePath(hierarchyExampleIds.ROOT_OPERATOR_ID);
}

function toAuthState(user: User | null) {
  return {
    currentUser: user,
    currentRole: user?.profile.role ?? null,
    isAuthenticated: Boolean(user),
  };
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  currentUser: null,
  currentRole: null,
  isAuthenticated: false,
  isInitializing: true,

  initialize: async () => {
    if (typeof window === "undefined") return;

    const token =
      localStorage.getItem("mdu_access_token") ||
      sessionStorage.getItem("mdu_access_token");

    if (token) {
      try {
        const meRes = await fetch(`${OWSEC_URL}/api/v1/oauth2?me=true`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (meRes.ok) {
          const profile = await meRes.json();
          const mappedRole = mapBackendRole(profile.userRole || "");
          const scopePath = getScopeForRole(mappedRole);

          const user: User = {
            id: profile.id || "user-id-placeholder",
            name: profile.name || profile.email || "Tip User",
            email: profile.email || "tip@ucentral.com",
            status: "active",
            profile: {
              profileId: `profile-mapped-${mappedRole}`,
              profileName: getRoleDisplayName(mappedRole),
              role: mappedRole,
              assignmentCount: 1,
            },
            scopeAssignments: [
              {
                id: `assignment-mapped-${mappedRole}`,
                role: mappedRole,
                profileId: `profile-mapped-${mappedRole}`,
                profileName: getRoleDisplayName(mappedRole),
                scopePath: scopePath,
                assignedAt: new Date().toISOString(),
              }
            ],
            lastLoginAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set(() => ({
            currentUser: user,
            currentRole: user.profile.role,
            isAuthenticated: true,
            isInitializing: false,
          }));
          return;
        }
      } catch (err) {
        console.error("Failed to restore session from server:", err);
      }
    }

    localStorage.removeItem("mdu_access_token");
    sessionStorage.removeItem("mdu_access_token");
    set(() => ({
      currentUser: null,
      currentRole: null,
      isAuthenticated: false,
      isInitializing: false,
    }));
  },

  loginAsUser: async (email, password = "", rememberMe) => {
    try {
      const res = await fetch(`${OWSEC_URL}/api/v1/oauth2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: email, password }),
      });

      if (!res.ok) {
        return false;
      }

      const authData = await res.json();
      const token = authData.access_token;

      if (!token) {
        return false;
      }

      const meRes = await fetch(`${OWSEC_URL}/api/v1/oauth2?me=true`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!meRes.ok) {
        return false;
      }

      const profile = await meRes.json();
      const mappedRole = mapBackendRole(profile.userRole || "");
      const scopePath = getScopeForRole(mappedRole);

      const user: User = {
        id: profile.id || "user-id-placeholder",
        name: profile.name || profile.email || "Tip User",
        email: profile.email || "tip@ucentral.com",
        status: "active",
        profile: {
          profileId: `profile-mapped-${mappedRole}`,
          profileName: getRoleDisplayName(mappedRole),
          role: mappedRole,
          assignmentCount: 1,
        },
        scopeAssignments: [
          {
            id: `assignment-mapped-${mappedRole}`,
            role: mappedRole,
            profileId: `profile-mapped-${mappedRole}`,
            profileName: getRoleDisplayName(mappedRole),
            scopePath: scopePath,
            assignedAt: new Date().toISOString(),
          }
        ],
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (rememberMe) {
        localStorage.setItem("mdu_access_token", token);
      } else {
        sessionStorage.setItem("mdu_access_token", token);
      }

      set(() => ({
        currentUser: user,
        currentRole: user.profile.role,
        isAuthenticated: true,
      }));

      return true;
    } catch (err) {
      console.error("Login request failed:", err);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("mdu_access_token");
    sessionStorage.removeItem("mdu_access_token");
    set(() => ({
      currentUser: null,
      currentRole: null,
      isAuthenticated: false,
    }));
  },

  switchRole: (role) => {
    const user = mockUsers.find((item) => item.profile.role === role) ?? null;
    if (user) {
      const token = `mock-token-${user.email}`;
      if (localStorage.getItem("mdu_access_token")) {
        localStorage.setItem("mdu_access_token", token);
      } else if (sessionStorage.getItem("mdu_access_token")) {
        sessionStorage.setItem("mdu_access_token", token);
      }
    }
    set(() => toAuthState(user));
  },

  switchUser: (userId) => {
    const user = mockUsersById[userId] ?? null;
    if (user) {
      const token = `mock-token-${user.email}`;
      if (localStorage.getItem("mdu_access_token")) {
        localStorage.setItem("mdu_access_token", token);
      } else if (sessionStorage.getItem("mdu_access_token")) {
        sessionStorage.setItem("mdu_access_token", token);
      }
    }
    set(() => toAuthState(user));
  },
}));
