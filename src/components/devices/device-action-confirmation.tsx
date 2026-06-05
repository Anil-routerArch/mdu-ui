"use client";

import { useMemo, useState } from "react";

import { ConfirmationDialog } from "@/components/states";
import type { Device, DeviceAction } from "@/types/device";

const actionLabels: Record<DeviceAction, string> = {
  reboot: "Reboot",
  upgrade_firmware: "Upgrade Firmware",
  blink_led: "Blink LED",
  factory_reset: "Factory Reset",
};

const actionDescriptions: Record<DeviceAction, string> = {
  reboot: "Reboot this device to recover or apply runtime changes.",
  upgrade_firmware: "Queue a firmware upgrade using the available target version.",
  blink_led: "Blink the device LED to help identify the hardware in the field.",
  factory_reset: "Reset the device to factory defaults and remove its operational state.",
};

type DeviceActionConfirmationProps = {
  action: DeviceAction | null;
  device: Device | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeviceActionConfirmation({
  action,
  device,
  open,
  onOpenChange,
}: DeviceActionConfirmationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const impactItems = useMemo(() => {
    if (!action || !device) {
      return [];
    }

    if (action === "factory_reset") {
      return [
        "Device configuration may need reassignment after reset",
        "Connectivity will be interrupted during recovery",
        `Current assignment: ${device.assignment?.nodeName ?? "Unassigned"}`,
      ];
    }

    if (action === "upgrade_firmware") {
      return [
        `Current firmware: ${device.firmware.currentVersion}`,
        `Target firmware: ${device.firmware.targetVersion ?? device.firmware.availableVersion ?? "Not available"}`,
        "Upgrade is mock only in this phase",
      ];
    }

    if (action === "reboot") {
      return [
        "Device traffic may be interrupted briefly",
        `Current health summary: ${device.health.summary}`,
      ];
    }

    return ["LED identification is mock only in this phase", "No persistent action is executed"];
  }, [action, device]);

  if (!action || !device) {
    return null;
  }

  return (
    <ConfirmationDialog
      open={open}
      title={`${actionLabels[action]} ${device.name}`}
      description={actionDescriptions[action]}
      confirmLabel={actionLabels[action]}
      cancelLabel="Cancel"
      variant={action === "factory_reset" ? "danger" : "default"}
      impactItems={impactItems}
      isSubmitting={isSubmitting}
      onCancel={() => {
        setIsSubmitting(false);
        onOpenChange(false);
      }}
      onConfirm={() => {
        setIsSubmitting(true);
        window.setTimeout(() => {
          setIsSubmitting(false);
          onOpenChange(false);
        }, 600);
      }}
    />
  );
}
