"use client";

import { useMemo, useState } from "react";
import { Layers3Icon, MapPinIcon } from "lucide-react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { isNodeWithinSubtree, mockHierarchyNodes } from "@/lib/mock-data/hierarchy";
import { useAuthStore } from "@/stores/auth-store";
import { useScopeStore } from "@/stores/scope-store";
import { useUiStore } from "@/stores/ui-store";

export function GlobalSearchOverlay() {
  const [query, setQuery] = useState("");
  const currentUser = useAuthStore((state) => state.currentUser);
  const globalSearchOpen = useUiStore((state) => state.globalSearchOpen);
  const closeGlobalSearch = useUiStore((state) => state.closeGlobalSearch);
  const setSelectedNode = useScopeStore((state) => state.setSelectedNode);

  const accessibleHierarchyNodes = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    return mockHierarchyNodes.filter((node) =>
      currentUser.scopeAssignments.some((assignment) => {
        const rootId = assignment.scopePath[0]?.id;
        return rootId ? isNodeWithinSubtree(node.id, rootId) : false;
      }),
    );
  }, [currentUser]);

  const filteredNodes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return accessibleHierarchyNodes.slice(0, 12);
    }

    return accessibleHierarchyNodes.filter((node) =>
      [node.name, node.type, node.path.map((item) => item.name).join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [accessibleHierarchyNodes, query]);

  return (
    <CommandDialog
      open={globalSearchOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeGlobalSearch();
          setQuery("");
        }
      }}
      title="Global Search"
      description="Search permitted hierarchy nodes."
      className="max-w-2xl"
    >
      <Command>
        <CommandInput
          placeholder="Search hierarchy nodes..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No permitted results found.</CommandEmpty>
          <CommandGroup heading="Hierarchy">
            {filteredNodes.map((node) => (
              <CommandItem
                key={node.id}
                value={`${node.name} ${node.type}`}
                onSelect={() => {
                  setSelectedNode(node.id);
                  closeGlobalSearch();
                  setQuery("");
                }}
              >
                <Layers3Icon className="size-4 text-slate-500" />
                <div className="min-w-0">
                  <div className="font-medium text-slate-900">{node.name}</div>
                  <div className="flex items-center gap-1 truncate text-xs text-slate-500">
                    <MapPinIcon className="size-3" />
                    {node.path.map((item) => item.name).join(" / ")}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
