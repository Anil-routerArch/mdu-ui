export const ROUTES = {
  root: "/",
  login: "/login",
  dashboard: "/dashboard",
  hierarchy: "/hierarchy",
  devices: "/devices",
  deviceDetail: (deviceId: string) => `/devices/${deviceId}`,
  configurations: "/configurations",
  configurationDetail: (configId: string) => `/configurations/${configId}`,
  customers: "/customers",
  customerDetail: (customerId: string) => `/customers/${customerId}`,
  billing: "/billing",
  users: "/users",
  userDetail: (userId: string) => `/users/${userId}`,
  administration: "/administration",
} as const;

export type AppRouteKey = keyof typeof ROUTES;
