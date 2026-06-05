"use client";

import { BellIcon, CircleHelpIcon, MenuIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUiStore } from "@/stores/ui-store";

import { UserProfileMenu } from "@/components/shell/user-profile-menu";

export function TopAppHeader() {
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const openMobileSidebar = useUiStore((state) => state.openMobileSidebar);
  const openGlobalSearch = useUiStore((state) => state.openGlobalSearch);

  return (
    <header className="border-b border-slate-800 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            className="hidden size-10 rounded-xl text-white hover:bg-white/10 hover:text-white lg:inline-flex"
            onClick={toggleSidebar}
          >
            <MenuIcon className="size-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="size-10 rounded-xl text-white hover:bg-white/10 hover:text-white lg:hidden"
            onClick={openMobileSidebar}
          >
            <MenuIcon className="size-5" />
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-950/40">
              <span className="text-lg font-bold">M</span>
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">MDU UI</p>
              <p className="text-xs text-slate-300">Multi-Tenant Management</p>
            </div>
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 justify-center px-6 md:flex">
          <Button
            type="button"
            variant="ghost"
            onClick={openGlobalSearch}
            className="h-12 w-full max-w-xl justify-between rounded-2xl border border-white/10 bg-white/8 px-4 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <span className="flex items-center gap-2">
              <SearchIcon className="size-4" />
              Search
            </span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs">
              Ctrl + K
            </span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            className="size-10 rounded-xl text-white hover:bg-white/10 hover:text-white md:hidden"
            onClick={openGlobalSearch}
          >
            <SearchIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="size-10 rounded-xl text-white hover:bg-white/10 hover:text-white"
          >
            <BellIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="size-10 rounded-xl text-white hover:bg-white/10 hover:text-white"
          >
            <CircleHelpIcon className="size-4" />
          </Button>
          <Separator orientation="vertical" className="hidden h-8 bg-white/10 sm:block" />
          <UserProfileMenu />
        </div>
      </div>
    </header>
  );
}
