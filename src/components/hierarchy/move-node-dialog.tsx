"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { HierarchyNode } from "@/types/hierarchy";

type MoveNodeDialogProps = {
  open: boolean;
  node: HierarchyNode;
  availableTargets: HierarchyNode[];
  onOpenChange: (open: boolean) => void;
};

export function MoveNodeDialog({
  open,
  node,
  availableTargets,
  onOpenChange,
}: MoveNodeDialogProps) {
  const [targetId, setTargetId] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  const currentPath = useMemo(
    () => node.path.map((item) => item.name).join(" / "),
    [node.path],
  );

  const selectedTarget = availableTargets.find((target) => target.id === targetId);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setTargetId("");
          setSubmitted(false);
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Move Node</DialogTitle>
          <DialogDescription>
            Mock move flow only. Changes are not persisted in this phase.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 text-sm text-slate-700">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Current Node
            </p>
            <p className="mt-1 font-medium text-slate-900">{node.name}</p>
            <p className="mt-1 text-xs text-slate-500">{currentPath}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Allowed Target Parent</label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a target parent" />
              </SelectTrigger>
              <SelectContent>
                {availableTargets.map((target) => (
                  <SelectItem key={target.id} value={target.id}>
                    {target.name} · {target.type.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-3 text-sm text-amber-900">
            Moving this node may affect descendant scopes, assigned devices, and inherited configurations.
          </div>

          {submitted ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Mock move prepared to move <strong>{node.name}</strong>
              {selectedTarget ? ` under ${selectedTarget.name}.` : "."}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => setSubmitted(true)} disabled={!targetId}>
            Move Node
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
