"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

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
import { Textarea } from "@/components/ui/textarea";
import { validateConfigurationDraft } from "@/lib/mock-api/configurations";
import type { SelectedScope } from "@/types/hierarchy";
import { ConfigurationValidationErrors } from "./configuration-validation-errors";

type CreateConfigurationDialogProps = {
  open: boolean;
  selectedScope: SelectedScope;
  onOpenChange: (open: boolean) => void;
};

export function CreateConfigurationDialog({
  open,
  selectedScope,
  onOpenChange,
}: CreateConfigurationDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [settings, setSettings] = useState('{\n  "ssid": "MDU-Guest"\n}');
  const [submitted, setSubmitted] = useState(false);

  const validationQuery = useQuery({
    queryKey: [
      "create-configuration-validation",
      name,
      selectedScope.nodeId,
      settings,
    ],
    queryFn: () =>
      validateConfigurationDraft({
        name,
        scopeId: selectedScope.nodeId,
        values: settings.trim() ? { settings } : {},
      }),
    enabled: open,
  });

  const reset = () => {
    setName("");
    setDescription("");
    setSettings('{\n  "ssid": "MDU-Guest"\n}');
    setSubmitted(false);
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Configuration</DialogTitle>
          <DialogDescription>
            Mock-only configuration creation. No persistent mutation is performed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 text-sm text-slate-700">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Target Scope
            </p>
            <p className="mt-1">{selectedScope.path.map((item) => item.name).join(" / ")}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Name</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <Input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Settings Placeholder</label>
            <Textarea
              className="min-h-40 font-mono"
              value={settings}
              onChange={(event) => setSettings(event.target.value)}
            />
          </div>

          {validationQuery.data ? (
            <ConfigurationValidationErrors
              errors={validationQuery.data}
              title="Draft Validation"
              suggestedFixes={{
                name: "Provide a distinct configuration name.",
                values: "Add at least one setting value to the draft.",
                scopeId: "Keep the selected hierarchy scope in place before creating.",
              }}
            />
          ) : null}

          {submitted ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Mock configuration draft captured for <strong>{name || "Unnamed Configuration"}</strong>.
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => setSubmitted(true)} disabled={!name.trim()}>
            Create Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
