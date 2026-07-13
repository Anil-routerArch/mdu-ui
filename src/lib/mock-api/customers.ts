import { getOperators } from "@/lib/mock-api/operators";
import type { Customer, CustomerSummary } from "@/types/customer";
import type { User } from "@/types/user";

const BASE_URL = process.env.NEXT_PUBLIC_OWSEC_URL;
const OWPROV_URL = BASE_URL ? `${BASE_URL.replace(/:\d+$/, "")}:16005` : "";

function checkProvServiceUrl() {
  if (!OWPROV_URL) {
    throw new Error(
      "Provisioning service is unreachable. NEXT_PUBLIC_OWSEC_URL is not configured in your environment (.env)."
    );
  }
}

function getHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token =
    localStorage.getItem("mdu_access_token") ||
    sessionStorage.getItem("mdu_access_token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

export async function getCustomers(
  scopeId: string | null,
  user: User
): Promise<Customer[]> {
  checkProvServiceUrl();

  // 1. Fetch operators to build mapping
  const operators = await getOperators();
  const operatorMap = new Map(operators.map((op) => [op.entityId, op]));

  // 2. Fetch all entities
  const res = await fetch(`${OWPROV_URL}/api/v1/entity?withExtendedInfo=true`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(
      errData?.ErrorDescription || "Failed to fetch entities from Provisioning service."
    );
  }

  const data = await res.json();
  const allEntities = data.entities || [];

  // 3. Map entities where parent is one of the operator entities
  const customers: Customer[] = [];
  const operatorEntityIds = new Set(operators.map((op) => op.entityId));

  for (const entity of allEntities) {
    // Skip if it is an operator-entity itself
    if (operatorEntityIds.has(entity.id) || (entity.operatorId && entity.operatorId !== "")) {
      continue;
    }

    const parentOperator = operatorMap.get(entity.parent);
    if (parentOperator) {
      customers.push({
        id: entity.id,
        name: entity.name,
        type: "customer",
        status: "active",
        parentId: entity.parent,
        path: [
          {
            id: parentOperator.entityId,
            type: "operator",
            name: parentOperator.name,
          },
          {
            id: entity.id,
            type: "customer",
            name: entity.name,
          },
        ],
        summary: {
          siteCount: entity.venues?.length || 0,
          venueCount: entity.venues?.length || 0,
          deviceCount: entity.devices?.length || 0,
          userCount: 0,
        },
        billing: {
          currentPlanName: null,
          currentPlanType: null,
          subscriptionStatus: null,
          deviceCountUsed: 0,
          deviceLimit: null,
        },
        createdAt: new Date(entity.created * 1000).toISOString(),
        updatedAt: new Date(entity.modified * 1000).toISOString(),
      });
    }
  }

  return customers;
}

export async function getCustomerById(
  customerId: string,
  user: User
): Promise<Customer> {
  checkProvServiceUrl();

  const res = await fetch(`${OWPROV_URL}/api/v1/entity/${customerId}?withExtendedInfo=true`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Customer not found.");
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.ErrorDescription || "Failed to fetch customer details.");
  }

  const entity = await res.json();

  // Fetch operators to resolve parent
  const operators = await getOperators();
  const parentOperator = operators.find((op) => op.entityId === entity.parent);

  return {
    id: entity.id,
    name: entity.name,
    type: "customer",
    status: "active",
    parentId: entity.parent,
    path: parentOperator
      ? [
          {
            id: parentOperator.entityId,
            type: "operator",
            name: parentOperator.name,
          },
          {
            id: entity.id,
            type: "customer",
            name: entity.name,
          },
        ]
      : [
          {
            id: entity.id,
            type: "customer",
            name: entity.name,
          },
        ],
    summary: {
      siteCount: entity.venues?.length || 0,
      venueCount: entity.venues?.length || 0,
      deviceCount: entity.devices?.length || 0,
      userCount: 0,
    },
    billing: {
      currentPlanName: null,
      currentPlanType: null,
      subscriptionStatus: null,
      deviceCountUsed: 0,
      deviceLimit: null,
    },
    description: entity.description,
    deviceRules: entity.deviceRules,
    sourceIP: entity.sourceIP,
    notes: entity.notes,
    createdAt: new Date(entity.created * 1000).toISOString(),
    updatedAt: new Date(entity.modified * 1000).toISOString(),
  };
}

export async function getCustomerSummary(
  customerId: string,
  user: User
): Promise<CustomerSummary> {
  const customer = await getCustomerById(customerId, user);
  return customer.summary;
}

export async function createCustomer(payload: {
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
}): Promise<Customer> {
  checkProvServiceUrl();

  // Create sub-entity under the chosen parent (POST to /entity/0)
  const res = await fetch(`${OWPROV_URL}/api/v1/entity/0`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      name: payload.name,
      parent: payload.parent,
      description: payload.description || undefined,
      deviceRules: payload.deviceRules || {
        firmwareUpgrade: "inherit",
        rcOnly: "inherit",
        rrm: "inherit",
      },
      sourceIP: payload.sourceIP || [],
      notes: payload.notes || [],
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.ErrorDescription || "Failed to create customer entity.");
  }

  const entity = await res.json();

  // Fetch operators to resolve parent
  const operators = await getOperators();
  const parentOperator = operators.find((op) => op.entityId === entity.parent);

  return {
    id: entity.id,
    name: entity.name,
    type: "customer",
    status: "active",
    parentId: entity.parent,
    path: parentOperator
      ? [
          {
            id: parentOperator.entityId,
            type: "operator",
            name: parentOperator.name,
          },
          {
            id: entity.id,
            type: "customer",
            name: entity.name,
          },
        ]
      : [
          {
            id: entity.id,
            type: "customer",
            name: entity.name,
          },
        ],
    summary: {
      siteCount: entity.venues?.length || 0,
      venueCount: entity.venues?.length || 0,
      deviceCount: entity.devices?.length || 0,
      userCount: 0,
    },
    billing: {
      currentPlanName: null,
      currentPlanType: null,
      subscriptionStatus: null,
      deviceCountUsed: 0,
      deviceLimit: null,
    },
    createdAt: new Date(entity.created * 1000).toISOString(),
    updatedAt: new Date(entity.modified * 1000).toISOString(),
  };
}

export async function deleteCustomer(customerId: string): Promise<boolean> {
  checkProvServiceUrl();

  const res = await fetch(`${OWPROV_URL}/api/v1/entity/${customerId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.ErrorDescription || "Failed to delete customer entity.");
  }

  return true;
}

export async function updateCustomer(
  customerId: string,
  payload: {
    name?: string;
    description?: string;
    deviceRules?: {
      firmwareUpgrade: string;
      rcOnly: string;
      rrm: string;
    };
    sourceIP?: string[];
    notes?: { note: string }[];
  }
): Promise<Customer> {
  checkProvServiceUrl();

  const res = await fetch(`${OWPROV_URL}/api/v1/entity/${customerId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({
      name: payload.name,
      description: payload.description,
      deviceRules: payload.deviceRules,
      sourceIP: payload.sourceIP,
      notes: payload.notes,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.ErrorDescription || "Failed to update customer entity details.");
  }

  return getCustomerById(customerId, { id: "current-user" } as any);
}

