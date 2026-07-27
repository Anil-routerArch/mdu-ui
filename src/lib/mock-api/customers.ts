import { getOperators } from "@/lib/mock-api/operators";
import type { Customer, CustomerSummary } from "@/types/customer";
import type { User } from "@/types/user";
import type { ScopePathItem } from "@/types/hierarchy";

import { getServiceUrl, checkServiceUrl, getHeaders } from "@/lib/api/config";

const OWPROV_URL = getServiceUrl("provisioning");

function checkProvServiceUrl() {
  checkServiceUrl("provisioning");
}

function buildScopePathForEntity(
  entity: any,
  allEntities: any[],
  operatorEntityIds: Set<string>
): ScopePathItem[] {
  const path: ScopePathItem[] = [];
  let current = entity;
  while (current && current.id !== "0000-0000-0000") {
    const isOp = operatorEntityIds.has(current.id) || (current.operatorId && current.operatorId !== "");
    path.unshift({
      id: current.id,
      name: current.name,
      type: isOp ? "operator" : "customer",
    });
    const parentId = current.parent;
    current = allEntities.find((e: any) => e.id === parentId);
  }
  // Add Top Entity
  path.unshift({
    id: "0000-0000-0000",
    name: "Top Entity",
    type: "operator",
  });
  return path;
}

export async function getCustomers(
  scopeId: string | null,
  user: User
): Promise<Customer[]> {
  checkProvServiceUrl();

  // 1. Fetch all management roles
  const rolesRes = await fetch(`${OWPROV_URL}/api/v1/managementRole`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!rolesRes.ok) {
    const errData = await rolesRes.json().catch(() => ({}));
    throw new Error(errData?.ErrorDescription || "Failed to fetch management roles.");
  }
  const rolesData = await rolesRes.json();
  const allRoles = rolesData.roles || rolesData.entries || [];

  // Find user's assigned entity IDs (case-insensitive check)
  const userRoles = allRoles.filter((role: any) =>
    Array.isArray(role.users) &&
    role.users.some((u: string) => u.toLowerCase() === user.id.toLowerCase())
  );
  const assignedEntityIds = new Set<string>();
  userRoles.forEach((role: any) => {
    if (role.entity) {
      assignedEntityIds.add(role.entity);
    }
  });

  // Root users are not explicitly assigned to a sub-entity and have top-level access
  if (user.profile.role === "root") {
    assignedEntityIds.add("0000-0000-0000");
  }

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

  // 3. Fetch operators to build mapping for type determination
  const operators = await getOperators();
  const operatorEntityIds = new Set(operators.map((op) => op.entityId));

  // Helper to check if string is a valid UUID
  const isRealUuid = (id: string): boolean => {
    if (id === "0000-0000-0000") return true;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  // Resolve mock scopeId to real database entity UUID
  let resolvedScopeId = scopeId;
  if (scopeId && !isRealUuid(scopeId)) {
    if (scopeId === "op-operator-a") {
      resolvedScopeId = Array.from(assignedEntityIds)[0] || null;
    } else {
      // Find corresponding child of the assigned entity for mock IDs like "cust-customer-b"
      const parentId = Array.from(assignedEntityIds)[0];
      if (parentId) {
        const children = allEntities.filter((e: any) => e.parent === parentId);
        if (children.length > 0) {
          resolvedScopeId = children[0].id;
        }
      }
    }
  }

  // 4. Filter entities whose parent belongs to the assigned entities of the user
  let childEntities = allEntities.filter((entity: any) =>
    entity.parent && assignedEntityIds.has(entity.parent)
  );

  // If a specific scopeId is chosen, filter by that parent scope
  if (resolvedScopeId) {
    childEntities = childEntities.filter((entity: any) => entity.parent === resolvedScopeId);
  }

  const customers: Customer[] = [];

  for (const entity of childEntities) {
    const isOperator = operatorEntityIds.has(entity.id) || (entity.operatorId && entity.operatorId !== "");

    customers.push({
      id: entity.id,
      name: entity.name,
      type: isOperator ? "sub_operator" : "customer",
      status: "active",
      parentId: entity.parent,
      path: buildScopePathForEntity(entity, allEntities, operatorEntityIds),
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
  const operatorEntityIds = new Set(operators.map((op) => op.entityId));

  // Fetch all entities to build the path
  const entitiesRes = await fetch(`${OWPROV_URL}/api/v1/entity`, {
    method: "GET",
    headers: getHeaders(),
  });
  const entitiesData = await entitiesRes.json().catch(() => ({}));
  const allEntities = entitiesData.entities || [];

  const isOperator = operatorEntityIds.has(entity.id) || (entity.operatorId && entity.operatorId !== "");

  return {
    id: entity.id,
    name: entity.name,
    type: isOperator ? "sub_operator" : "customer",
    status: "active",
    parentId: entity.parent,
    path: buildScopePathForEntity(entity, allEntities, operatorEntityIds),
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
  const operatorEntityIds = new Set(operators.map((op) => op.entityId));

  // Fetch all entities to build the path
  const entitiesRes = await fetch(`${OWPROV_URL}/api/v1/entity`, {
    method: "GET",
    headers: getHeaders(),
  });
  const entitiesData = await entitiesRes.json().catch(() => ({}));
  const allEntities = entitiesData.entities || [];

  const isOperator = operatorEntityIds.has(entity.id) || (entity.operatorId && entity.operatorId !== "");

  return {
    id: entity.id,
    name: entity.name,
    type: isOperator ? "sub_operator" : "customer",
    status: "active",
    parentId: entity.parent,
    path: buildScopePathForEntity(entity, allEntities, operatorEntityIds),
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

export async function getAssignedEntitiesForUser(user: User): Promise<{ id: string; name: string }[]> {
  checkProvServiceUrl();

  // If root user, return Top Entity
  if (user.profile.role === "root") {
    return [{ id: "0000-0000-0000", name: "Top Entity" }];
  }

  // 1. Fetch all management roles
  const rolesRes = await fetch(`${OWPROV_URL}/api/v1/managementRole`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!rolesRes.ok) {
    const errData = await rolesRes.json().catch(() => ({}));
    throw new Error(errData?.ErrorDescription || "Failed to fetch management roles.");
  }
  const rolesData = await rolesRes.json();
  const allRoles = rolesData.roles || rolesData.entries || [];

  // Find user's assigned entity IDs (case-insensitive check)
  const userRoles = allRoles.filter((role: any) =>
    Array.isArray(role.users) &&
    role.users.some((u: string) => u.toLowerCase() === user.id.toLowerCase())
  );
  const assignedEntityIds = new Set<string>();
  userRoles.forEach((role: any) => {
    if (role.entity) {
      assignedEntityIds.add(role.entity);
    }
  });

  // 2. Fetch all entities to get their names
  const res = await fetch(`${OWPROV_URL}/api/v1/entity`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.ErrorDescription || "Failed to fetch entities.");
  }
  const data = await res.json();
  const allEntities = data.entities || [];

  // Filter and map to simple objects
  return allEntities
    .filter((entity: any) => assignedEntityIds.has(entity.id))
    .map((entity: any) => ({
      id: entity.id,
      name: entity.name,
    }));
}

