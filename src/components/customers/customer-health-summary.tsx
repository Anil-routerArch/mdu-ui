import { ActivityIcon, Building2Icon, RouterIcon, UsersIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Customer, CustomerSummary } from "@/types/customer";

type CustomerHealthSummaryProps = {
  customer: Customer;
  summary: CustomerSummary;
};

function getOperationalStatus(customer: Customer, summary: CustomerSummary): string {
  if (customer.status === "suspended") {
    return "Operational access restricted";
  }

  if (customer.status === "inactive") {
    return "Scope inactive";
  }

  if (customer.status === "provisioning") {
    return "Provisioning in progress";
  }

  if (summaryHasDevices(summary)) {
    return "Operational and device-bearing";
  }

  return "Active with limited deployed resources";
}

function summaryHasDevices(summary: CustomerSummary) {
  return summary.deviceCount > 0;
}

export function CustomerHealthSummary({
  customer,
  summary,
}: CustomerHealthSummaryProps) {
  const operationalStatus = getOperationalStatus(customer, summary);

  const cards = [
    {
      label: "Operational Status",
      value: operationalStatus,
      icon: ActivityIcon,
      accent: "bg-blue-50 text-blue-700",
    },
    {
      label: "Infrastructure Devices",
      value: summary.deviceCount.toString(),
      icon: RouterIcon,
      accent: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Users",
      value: summary.userCount.toString(),
      icon: UsersIcon,
      accent: "bg-violet-50 text-violet-700",
    },
    {
      label: "Sites / Venues",
      value: `${summary.siteCount} / ${summary.venueCount}`,
      icon: Building2Icon,
      accent: "bg-amber-50 text-amber-700",
    },
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.label} className="border border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="text-sm text-slate-500">{card.label}</CardTitle>
              </div>
              <span
                className={`inline-flex size-10 items-center justify-center rounded-full ${card.accent}`}
              >
                <Icon className="size-4" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-base font-semibold text-slate-950">{card.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
