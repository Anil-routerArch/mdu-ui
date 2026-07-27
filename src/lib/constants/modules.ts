import { ROUTES } from "@/lib/constants/routes";

export const APP_MODULES = [
  { key: "dashboard", label: "Dashboard", href: ROUTES.dashboard },
  { key: "customers", label: "Customers", href: ROUTES.customers },
  { key: "hierarchy", label: "Hierarchy", href: ROUTES.hierarchy },
  { key: "devices", label: "Devices", href: ROUTES.devices },
  {
    key: "configurations",
    label: "Configurations",
    href: ROUTES.configurations,
  },
  { key: "billing", label: "Billing", href: ROUTES.billing },
  { key: "operators", label: "Operators", href: ROUTES.operators },
  { key: "users", label: "Users", href: ROUTES.users },
  {
    key: "administration",
    label: "Policies",
    href: ROUTES.administration,
  },
] as const;

export type AppModule = (typeof APP_MODULES)[number];
