"use client";

import type { ModuleKey } from "@/types/rbac";
import { create } from "zustand";

export type WorkspaceTab =
  | "overview"
  | "topology"
  | "devices"
  | "configurations";

type UiStoreState = {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  globalSearchOpen: boolean;
  activeModule: ModuleKey;
  activeWorkspaceTab: WorkspaceTab;
  setActiveModule: (module: ModuleKey) => void;
  setActiveWorkspaceTab: (tab: WorkspaceTab) => void;
  toggleSidebar: () => void;
  openGlobalSearch: () => void;
  closeGlobalSearch: () => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
};

export const useUiStore = create<UiStoreState>((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  globalSearchOpen: false,
  activeModule: "dashboard",
  activeWorkspaceTab: "overview",
  setActiveModule: (module) => {
    set(() => ({
      activeModule: module,
    }));
  },
  setActiveWorkspaceTab: (tab) => {
    set(() => ({
      activeWorkspaceTab: tab,
    }));
  },
  toggleSidebar: () => {
    set((state) => ({
      sidebarCollapsed: !state.sidebarCollapsed,
    }));
  },
  openGlobalSearch: () => {
    set(() => ({
      globalSearchOpen: true,
    }));
  },
  closeGlobalSearch: () => {
    set(() => ({
      globalSearchOpen: false,
    }));
  },
  openMobileSidebar: () => {
    set(() => ({
      mobileSidebarOpen: true,
    }));
  },
  closeMobileSidebar: () => {
    set(() => ({
      mobileSidebarOpen: false,
    }));
  },
}));
