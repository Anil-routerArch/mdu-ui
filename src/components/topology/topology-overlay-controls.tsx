"use client";

import { Layers3Icon, Link2Icon, RadioIcon, RouterIcon, ServerIcon, WifiIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type TopologyOverlayState = {
  gateways: boolean;
  switches: boolean;
  access_points: boolean;
  health: boolean;
  links: boolean;
  wireless_quality: boolean;
};

type OverlayItem = {
  key: keyof TopologyOverlayState;
  label: string;
  icon: typeof RouterIcon;
  disabled?: boolean;
};

const overlayItems: OverlayItem[] = [
  { key: "gateways", label: "Gateways", icon: RouterIcon },
  { key: "switches", label: "Switches", icon: ServerIcon },
  { key: "access_points", label: "Access Points", icon: WifiIcon },
  { key: "health", label: "Health", icon: Layers3Icon },
  { key: "links", label: "Links", icon: Link2Icon },
  {
    key: "wireless_quality",
    label: "Wireless Quality",
    icon: RadioIcon,
    disabled: true,
  },
];

type TopologyOverlayControlsProps = {
  overlays: TopologyOverlayState;
  onToggle: (key: keyof TopologyOverlayState) => void;
};

export function TopologyOverlayControls({
  overlays,
  onToggle,
}: TopologyOverlayControlsProps) {
  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base text-slate-950">Overlay Controls</CardTitle>
          <Badge variant="outline" className="bg-slate-50 text-slate-700">
            Local to tab
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {overlayItems.map((item) => {
          const Icon = item.icon;
          const active = overlays[item.key];

          return (
            <Button
              key={item.key}
              type="button"
              variant={active ? "default" : "outline"}
              size="sm"
              disabled={item.disabled}
              className={cn(item.disabled && "opacity-60")}
              onClick={() => onToggle(item.key)}
            >
              <Icon className="size-4" />
              {item.label}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
