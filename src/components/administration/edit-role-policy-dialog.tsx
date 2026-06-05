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
import { PermissionChangeImpactWarning } from "./permission-change-impact-warning";
import type { RoleProfile } from "@/types/rbac";

type EditRolePolicyDialogProps = {
  profile: RoleProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function summarizeModules(profile: RoleProfile) {
  return Array.from(new Set(profile.rules.map((rule) => rule.module)));
}

export function EditRolePolicyDialog({
  profile,
  open,
  onOpenChange,
}: EditRolePolicyDialogProps) {
  const [name, setName] = useState(profile?.name ?? "");
  const [submitted, setSubmitted] = useState(false);

  const modules = useMemo(() => (profile ? summarizeModules(profile) : []), [profile]);

  if (!profile) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setName(profile.name);
          setSubmitted(false);
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Role / Policy</DialogTitle>
          <DialogDescription>
            Mock-only role/policy edit flow. Raw OWPROV internals are intentionally not exposed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Profile Name</label>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </div>

          <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4 text-sm text-slate-700">
            <p className="font-medium text-slate-900">Module Access Summary</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {modules.map((module) => (
                <div key={module} className="rounded-lg border border-slate-200/70 bg-white p-3">
                  <p className="font-medium capitalize text-slate-900">{module}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Access placeholder derived from business-facing profile rules.
                  </p>
                </div>
              ))}
            </div>
          </div>

          <PermissionChangeImpactWarning
            affectedUsersCount={1}
            affectedScopes={[profile.role.replaceAll("_", " ")]}
            affectedModules={modules.map((module) => module.replaceAll("_", " "))}
          />

          {submitted ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Mock policy change prepared for <strong>{name || profile.name}</strong>.
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => setSubmitted(true)} disabled={!name.trim()}>
            Save Policy Draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
