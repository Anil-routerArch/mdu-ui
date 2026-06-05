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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { HierarchyNodeType, SelectedScope } from "@/types/hierarchy";

const nodeTypes: HierarchyNodeType[] = [
  "customer",
  "sub_operator",
  "site",
  "building",
  "tower",
  "floor",
  "venue",
];

type CreateNodeDialogProps = {
  open: boolean;
  parentScope: SelectedScope;
  onOpenChange: (open: boolean) => void;
};

export function CreateNodeDialog({
  open,
  parentScope,
  onOpenChange,
}: CreateNodeDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<HierarchyNodeType>("site");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const scopeSummary = useMemo(
    () => parentScope.path.map((item) => item.name).join(" / "),
    [parentScope.path],
  );

  const reset = () => {
    setName("");
    setType("site");
    setDescription("");
    setSubmitted(false);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          reset();
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Node</DialogTitle>
          <DialogDescription>
            Mock create flow only. This does not persist changes yet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 text-sm text-slate-700">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Parent Scope
            </p>
            <p className="mt-1">{scopeSummary}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Node Name</label>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Node Type</label>
            <Select value={type} onValueChange={(value) => setType(value as HierarchyNodeType)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a node type" />
              </SelectTrigger>
              <SelectContent>
                {nodeTypes.map((nodeType) => (
                  <SelectItem key={nodeType} value={nodeType}>
                    {nodeType.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          {submitted ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Mock request captured for <strong>{name || "Unnamed Node"}</strong> under this scope.
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!name.trim()}>
            Create Node
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
