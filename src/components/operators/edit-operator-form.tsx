"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { updateOperator } from "@/lib/mock-api/operators";
import type { Operator } from "@/types/operator";

type EditOperatorFormProps = {
  operator: Operator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditOperatorForm({ operator, open, onOpenChange }: EditOperatorFormProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [registrationId, setRegistrationId] = useState("");
  const [description, setDescription] = useState("");
  const [firmwareUpgrade, setFirmwareUpgrade] = useState("inherit");
  const [rcOnly, setRcOnly] = useState("inherit");
  const [rrm, setRrm] = useState("inherit");
  const [note, setNote] = useState("");
  const [sourceIPsRaw, setSourceIPsRaw] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (operator && open) {
      setName(operator.name || "");
      setRegistrationId(operator.registrationId || "");
      setDescription(operator.description || "");
      setFirmwareUpgrade(operator.deviceRules?.firmwareUpgrade || "inherit");
      setRcOnly(operator.deviceRules?.rcOnly || "inherit");
      setRrm(operator.deviceRules?.rrm || "inherit");
      setNote(operator.notes?.[0]?.note || "");
      setSourceIPsRaw(operator.sourceIP?.join(", ") || "");
      setError(null);
    }
  }, [operator, open]);

  const mutation = useMutation({
    mutationFn: (data: {
      name?: string;
      registrationId?: string;
      description?: string;
      deviceRules?: {
        firmwareUpgrade: string;
        rcOnly: string;
        rrm: string;
      };
      sourceIP?: string[];
      firmwareRCOnly?: boolean;
      notes?: { note: string }[];
    }) => updateOperator(operator!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operators"] });
      queryClient.invalidateQueries({ queryKey: ["operator", operator?.id] });
      onOpenChange(false);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to update operator details.");
    },
  });

  const handleSave = () => {
    if (!name.trim() || !registrationId.trim()) return;

    setError(null);

    const sourceIP = sourceIPsRaw
      .split(/[\s,]+/)
      .map((ip) => ip.trim())
      .filter(Boolean);

    mutation.mutate({
      name: name.trim(),
      registrationId: registrationId.trim(),
      description: description.trim() || "",
      deviceRules: {
        firmwareUpgrade,
        rcOnly,
        rrm,
      },
      sourceIP,
      firmwareRCOnly: false,
      notes: note.trim() ? [{ note: note.trim() }] : undefined,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-2xl" showCloseButton={false}>
        <DialogHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Edit Operator Details
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
              onClick={handleSave}
              disabled={!name.trim() || !registrationId.trim() || mutation.isPending}
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
              onClick={() => {
                onOpenChange(false);
              }}
              disabled={mutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Operator Name *
              </label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={mutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Registration ID *
              </label>
              <Input
                value={registrationId}
                onChange={(event) => setRegistrationId(event.target.value)}
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
      </DialogContent>
    </Dialog>
  );
}
