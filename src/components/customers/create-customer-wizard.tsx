"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, X } from "lucide-react";

import { LoadingState, ErrorState } from "@/components/states";
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
import { createCustomer } from "@/lib/mock-api/customers";
import { getOperators } from "@/lib/mock-api/operators";
import type { SelectedScope } from "@/types/hierarchy";
import type { User } from "@/types/user";

type CreateCustomerWizardProps = {
  open: boolean;
  selectedScope: SelectedScope;
  user: User;
  onOpenChange: (open: boolean) => void;
};

export function CreateCustomerWizard({
  open,
  selectedScope,
  user,
  onOpenChange,
}: CreateCustomerWizardProps) {
  const queryClient = useQueryClient();

  const [parentOperatorEntityId, setParentOperatorEntityId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [firmwareUpgrade, setFirmwareUpgrade] = useState("inherit");
  const [rcOnly, setRcOnly] = useState("inherit");
  const [rrm, setRrm] = useState("inherit");
  const [sourceIPsRaw, setSourceIPsRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch operators list to populate available parent entities
  const operatorsQuery = useQuery({
    queryKey: ["operators", user.id],
    enabled: open,
    queryFn: () => getOperators(),
  });

  const mutation = useMutation({
    mutationFn: (data: {
      name: string;
      parent: string;
      description?: string;
      deviceRules?: {
        firmwareUpgrade: string;
        rcOnly: string;
        rrm: string;
      };
      sourceIP?: string[];
      notes?: { note: string }[];
    }) => createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      reset();
      onOpenChange(false);
    },
    onError: (err: any) => {
      const rawMsg = err.message || "Failed to create customer entity on Provisioning service.";
      const friendlyMsg = rawMsg.includes("Invalid entity type") || rawMsg.includes("1064")
        ? "Invalid Entity Hierarchy: You cannot nest customer/subscriber entities under another customer. Customer entities can only be created directly under an Operator."
        : rawMsg;
      setError(friendlyMsg);
      setErrorMessage(friendlyMsg);
      setErrorDialogOpen(true);
    },
  });

  const reset = () => {
    setParentOperatorEntityId("");
    setName("");
    setDescription("");
    setNote("");
    setFirmwareUpgrade("inherit");
    setRcOnly("inherit");
    setRrm("inherit");
    setSourceIPsRaw("");
    setError(null);
    setErrorMessage("");
    setErrorDialogOpen(false);
  };

  const handleSave = () => {
    if (!name.trim() || !parentOperatorEntityId) return;

    setError(null);

    const sourceIP = sourceIPsRaw
      .split(/[\s,]+/)
      .map((ip) => ip.trim())
      .filter(Boolean);

    mutation.mutate({
      name: name.trim(),
      parent: parentOperatorEntityId,
      description: description.trim() || undefined,
      deviceRules: {
        firmwareUpgrade,
        rcOnly,
        rrm,
      },
      sourceIP,
      notes: note.trim() ? [{ note: note.trim() }] : undefined,
    });
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        <DialogHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Create Customer
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
              onClick={handleSave}
              disabled={!name.trim() || !parentOperatorEntityId || mutation.isPending}
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={mutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {operatorsQuery.isLoading ? (
          <div className="py-12">
            <LoadingState title="Loading parent operators" variant="section" rows={3} />
          </div>
        ) : operatorsQuery.isError ? (
          <div className="py-4">
            <ErrorState
              error={operatorsQuery.error}
              onRetry={() => void operatorsQuery.refetch()}
            />
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Parent Operator *
                </label>
                <Select
                  value={parentOperatorEntityId}
                  onValueChange={setParentOperatorEntityId}
                  disabled={mutation.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Parent Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {operatorsQuery.data?.map((op) => (
                      <SelectItem key={op.id} value={op.entityId}>
                        {op.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Customer / Tenant Name *
                </label>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={mutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <Input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={mutation.isPending}
                  placeholder="Optional operator description"
                  className="placeholder:text-slate-400/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Note
                </label>
                <Input
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  disabled={mutation.isPending}
                  placeholder="Optional operator notes"
                  className="placeholder:text-slate-400/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Firmware Upgrade (Device Rules)
                </label>
                <Select
                  value={firmwareUpgrade}
                  onValueChange={setFirmwareUpgrade}
                  disabled={mutation.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select firmware upgrade rule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inherit">Inherit</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  RC Only (Device Rules)
                </label>
                <Select
                  value={rcOnly}
                  onValueChange={setRcOnly}
                  disabled={mutation.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select RC Only rule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inherit">Inherit</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  RRM (Device Rules)
                </label>
                <Select
                  value={rrm}
                  onValueChange={setRrm}
                  disabled={mutation.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select RRM rule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inherit">Inherit</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Source IP Filter List
                </label>
                <Input
                  value={sourceIPsRaw}
                  onChange={(event) => setSourceIPsRaw(event.target.value)}
                  disabled={mutation.isPending}
                  placeholder="Comma separated IPs"
                  className="placeholder:text-slate-400/50"
                />
              </div>
            </div>
          </div>
        )}
      </DialogContent>

      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-rose-500/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-rose-600 dark:text-rose-400 flex items-center gap-2 text-lg font-semibold">
              <span>Creation Failed</span>
            </DialogTitle>
            <DialogDescription className="text-slate-700 dark:text-slate-300 pt-2 font-medium leading-relaxed">
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3">
            <Button type="button" variant="destructive" onClick={() => setErrorDialogOpen(false)}>
              Dismiss
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
