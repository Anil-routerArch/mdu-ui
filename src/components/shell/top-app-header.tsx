"use client";

import { useEffect, useRef, useState } from "react";
import { BellIcon, CircleHelpIcon, MenuIcon, SearchIcon } from "lucide-react";

import { Command } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { GlobalSearchResults } from "@/components/shell/global-search-overlay";
import { Separator } from "@/components/ui/separator";
import { useScopeStore } from "@/stores/scope-store";
import { useUiStore } from "@/stores/ui-store";

import { UserProfileMenu } from "@/components/shell/user-profile-menu";

export function TopAppHeader() {
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const openMobileSidebar = useUiStore((state) => state.openMobileSidebar);
  const globalSearchOpen = useUiStore((state) => state.globalSearchOpen);
  const openGlobalSearch = useUiStore((state) => state.openGlobalSearch);
  const closeGlobalSearch = useUiStore((state) => state.closeGlobalSearch);
  const setSelectedNode = useScopeStore((state) => state.setSelectedNode);

  useEffect(() => {
    if (globalSearchOpen) {
      inputRef.current?.focus();
    }
  }, [globalSearchOpen]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setQuery("");
        closeGlobalSearch();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openGlobalSearch();
        inputRef.current?.focus();
      }

      if (event.key === "Escape") {
        setQuery("");
        closeGlobalSearch();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeGlobalSearch, openGlobalSearch]);

  return (
    <header className="border-b border-white/10 bg-[linear-gradient(90deg,#071b4d_0%,#0a235e_45%,#0a1d48_100%)] text-white shadow-[0_12px_32px_rgba(7,27,77,0.18)]">
      <div className="flex h-[60px] items-center justify-between gap-3 px-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="hidden size-8 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white lg:inline-flex"
            onClick={toggleSidebar}
          >
            <MenuIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="size-8 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white lg:hidden"
            onClick={openMobileSidebar}
          >
            <MenuIcon className="size-4" />
          </Button>

          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[linear-gradient(180deg,#3b82f6_0%,#1d4ed8_100%)] shadow-[0_10px_20px_rgba(30,64,175,0.3)] ring-1 ring-white/15">
              <span className="text-base font-bold text-white">M</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-[1.35rem] font-semibold tracking-tight text-white">
                MDU
              </p>
              <p className="truncate text-[10px] font-medium tracking-wide text-blue-100/80">
                Multi-Tenant Management
              </p>
            </div>
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 justify-center px-4 md:flex">
          <div ref={containerRef} className="relative w-full max-w-[340px]">
            <div className="flex h-9 w-full items-center rounded-xl border border-white/12 bg-white/10 px-3 text-blue-50/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors focus-within:bg-white/14">
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  if (!globalSearchOpen) {
                    openGlobalSearch();
                  }
                }}
                onFocus={openGlobalSearch}
                placeholder="Search (Ctrl + K)"
                className="h-full flex-1 bg-transparent text-xs text-white placeholder:text-white/65 focus:outline-none"
              />
              <SearchIcon className="size-3.5 shrink-0 text-white/80" />
            </div>

            {globalSearchOpen ? (
              <div className="absolute left-0 top-[calc(100%+12px)] z-50 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_50px_rgba(15,23,42,0.18)]">
                <Command>
                  <GlobalSearchResults
                    query={query}
                    onSelectNode={(nodeId) => {
                      setSelectedNode(nodeId);
                      closeGlobalSearch();
                      setQuery("");
                    }}
                  />
                </Command>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            className="h-8 rounded-xl border border-white/10 bg-white/5 px-2.5 text-white hover:bg-white/10 hover:text-white md:hidden"
            onClick={openGlobalSearch}
          >
            <SearchIcon className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="relative size-8 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <BellIcon className="size-3.5" />
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500 ring-2 ring-[#0a235e]" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="size-8 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <CircleHelpIcon className="size-3.5" />
          </Button>
          <Separator orientation="vertical" className="hidden h-6 bg-white/10 sm:block" />
          <UserProfileMenu />
        </div>
      </div>
    </header>
  );
}
