"use client";

import { create } from "zustand";

type MockRuntimeStoreState = {
  forceBackendUnavailable: boolean;
  forceEmptyData: boolean;
  forcePartialData: boolean;
  forceError: boolean;
  forceNoPermission: boolean;
  artificialDelayMs: number;
  setForceBackendUnavailable: (value: boolean) => void;
  toggleForceBackendUnavailable: () => void;
  setForceEmptyData: (value: boolean) => void;
  toggleForceEmptyData: () => void;
  setForcePartialData: (value: boolean) => void;
  toggleForcePartialData: () => void;
  setForceError: (value: boolean) => void;
  toggleForceError: () => void;
  setForceNoPermission: (value: boolean) => void;
  toggleForceNoPermission: () => void;
  setArtificialDelayMs: (value: number) => void;
  resetRuntimeFlags: () => void;
};

const defaultRuntimeState = {
  forceBackendUnavailable: false,
  forceEmptyData: false,
  forcePartialData: false,
  forceError: false,
  forceNoPermission: false,
  artificialDelayMs: 0,
};

export const useMockRuntimeStore = create<MockRuntimeStoreState>((set) => ({
  ...defaultRuntimeState,
  setForceBackendUnavailable: (value) => {
    set(() => ({
      forceBackendUnavailable: value,
    }));
  },
  toggleForceBackendUnavailable: () => {
    set((state) => ({
      forceBackendUnavailable: !state.forceBackendUnavailable,
    }));
  },
  setForceEmptyData: (value) => {
    set(() => ({
      forceEmptyData: value,
    }));
  },
  toggleForceEmptyData: () => {
    set((state) => ({
      forceEmptyData: !state.forceEmptyData,
    }));
  },
  setForcePartialData: (value) => {
    set(() => ({
      forcePartialData: value,
    }));
  },
  toggleForcePartialData: () => {
    set((state) => ({
      forcePartialData: !state.forcePartialData,
    }));
  },
  setForceError: (value) => {
    set(() => ({
      forceError: value,
    }));
  },
  toggleForceError: () => {
    set((state) => ({
      forceError: !state.forceError,
    }));
  },
  setForceNoPermission: (value) => {
    set(() => ({
      forceNoPermission: value,
    }));
  },
  toggleForceNoPermission: () => {
    set((state) => ({
      forceNoPermission: !state.forceNoPermission,
    }));
  },
  setArtificialDelayMs: (value) => {
    set(() => ({
      artificialDelayMs: Math.max(0, value),
    }));
  },
  resetRuntimeFlags: () => {
    set(() => defaultRuntimeState);
  },
}));
