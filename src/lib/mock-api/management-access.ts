import { getOperators } from "@/lib/mock-api/operators";
import { getServiceUrl, checkServiceUrl, getHeaders } from "@/lib/api/config";

const OWPROV_URL = getServiceUrl("provisioning");

function checkProvServiceUrl() {
  checkServiceUrl("provisioning");
}

export type ManagementScope = "entity" | "venue";
export type ManagementRoleTemplate = "Admin" | "Installer" | "Support" | "Custom";
export type ManagementAccessPermission = "NOACCESS" | "READ" | "MODIFY" | "DELETE" | "LIST" | "CREATE" | "FULL";

export type ManagementResourceAccess = {
  access: ManagementAccessPermission[];
  resource: string;
};

export type ManagementPolicyEntry = {
  users?: string[];
  resources: string[];
  access: ManagementAccessPermission[];
  policy?: string;
};

export type ManagementPolicyApiResponse = {
  access?: ManagementAccessPermission[];
  created?: number;
  description?: string;
  entries?: ManagementPolicyEntry[];
  entity?: string;
  id: string;
  modified?: number;
  name: string;
  policy?: string;
  resources?: string[];
  users?: string[];
  venue?: string;
};

export type ManagementRoleApiResponse = {
  created?: number;
  description?: string;
  entity?: string;
  id: string;
  managementPolicy?: string;
  managementPolicyId?: string;
  modified?: number;
  name: string;
  users: string[];
  venue?: string;
};

export type ManagementPolicyRequest = {
  description?: string;
  entries: ManagementPolicyEntry[];
  entity: string;
  name?: string;
  venue?: string;
};

export type ManagementRoleRequest = {
  description?: string;
  entity: string;
  managementPolicy: string;
  name: string;
  users: string[];
  venue: string;
};

export type AssignUserAccessInput = {
  access: ManagementAccessPermission[];
  entityId: string;
  resources: string[];
  roleTemplate: ManagementRoleTemplate;
  scope: ManagementScope;
  userEmail: string;
  userId: string;
  venueId?: string;
  resourcePermissions?: ManagementResourceAccess[];
  policyName?: string;
  policyDescription?: string;
  currentUserRole?: string;
  currentUserId?: string;
};

export type ManagementAccessResult = {
  entityId: string;
  policyId: string;
  roleId: string;
  roleUpdated: boolean;
  venueId: string;
};

export const MANAGEMENT_ACCESS_PERMISSIONS: ManagementAccessPermission[] = [
  "NOACCESS",
  "READ",
  "MODIFY",
  "DELETE",
  "LIST",
  "CREATE",
  "FULL",
];

const TEMPLATE_ACCESS: Record<
  ManagementRoleTemplate,
  Record<
    ManagementScope,
    { access: ManagementAccessPermission[]; description: string; namePrefix: string; policyScope: string }
  >
> = {
  Admin: {
    entity: {
      access: ["FULL"],
      description: "Full entity access",
      namePrefix: "Entity Admin",
      policyScope: "entity-admin",
    },
    venue: {
      access: ["READ", "MODIFY", "LIST"],
      description: "Venue admin access",
      namePrefix: "Venue Admin",
      policyScope: "venue-admin",
    },
  },
  Installer: {
    entity: {
      access: ["READ", "LIST"],
      description: "Read-only entity access",
      namePrefix: "Entity Installer",
      policyScope: "entity-installer",
    },
    venue: {
      access: ["READ", "LIST"],
      description: "Read-only venue access",
      namePrefix: "Venue Installer",
      policyScope: "venue-installer",
    },
  },
  Support: {
    entity: {
      access: ["READ", "MODIFY", "LIST"],
      description: "Support entity access",
      namePrefix: "Entity Support",
      policyScope: "entity-support",
    },
    venue: {
      access: ["READ", "MODIFY", "LIST"],
      description: "Support venue access",
      namePrefix: "Venue Support",
      policyScope: "venue-support",
    },
  },
  Custom: {
    entity: {
      access: [],
      description: "Custom entity access",
      namePrefix: "Entity Custom",
      policyScope: "entity-custom",
    },
    venue: {
      access: [],
      description: "Custom venue access",
      namePrefix: "Venue Custom",
      policyScope: "venue-custom",
    },
  },
};

const getCollection = <T>(data: any, keys: string[]): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (typeof data !== "object" || data === null) return [] as T[];
  for (const key of keys) {
    if (Array.isArray(data[key])) return data[key] as T[];
  }
  return [] as T[];
};

const parsePolicyScope = (policy: string) => {
  try {
    const parsed = JSON.parse(policy) as {
      entityId?: string;
      includeChildEntities?: boolean;
      includeVenues?: boolean;
      scope?: string;
      template?: string;
      type?: string;
    };
    return {
      entityId: parsed.entityId ?? "",
      includeChildEntities: parsed.includeChildEntities ?? false,
      includeVenues: parsed.includeVenues ?? false,
      scope: parsed.type ?? parsed.scope ?? "",
      template: parsed.template ?? "",
    };
  } catch {
    return {
      entityId: "",
      includeChildEntities: false,
      includeVenues: false,
      scope: "",
      template: "",
    };
  }
};

const buildTemplateContext = (scope: ManagementScope, roleTemplate: ManagementRoleTemplate) =>
  TEMPLATE_ACCESS[roleTemplate][scope];

const buildManagementPolicyContext = ({
  entityId,
  scope,
}: {
  entityId: string;
  scope: ManagementScope;
}) => ({
  type: scope,
  entityId,
  includeVenues: true,
  includeChildEntities: true,
});

const buildManagementPolicyEntries = ({
  access,
  entityId,
  resources,
  resourcePermissions,
  scope,
  userId,
}: {
  access: ManagementAccessPermission[];
  entityId: string;
  resources: string[];
  resourcePermissions?: ManagementResourceAccess[];
  scope: ManagementScope;
  userId: string;
}) => {
  const context = buildManagementPolicyContext({ entityId, scope });

  if (resourcePermissions !== undefined) {
    return resourcePermissions
      .filter(({ resource }) => resource !== "")
      .map(({ resource, access: resourceAccess }) => ({
        users: [userId],
        resources: [resource],
        access: resourceAccess,
        policy: JSON.stringify(context),
      })) as ManagementPolicyEntry[];
  }

  return [
    {
      users: [userId],
      resources,
      access,
      policy: JSON.stringify(context),
    },
  ] as ManagementPolicyEntry[];
};

export const getTemplateAccess = (scope: ManagementScope, roleTemplate: ManagementRoleTemplate) =>
  buildTemplateContext(scope, roleTemplate).access;

export const buildManagementPolicyPayload = ({
  access,
  entityId,
  resources,
  resourcePermissions,
  roleTemplate,
  scope,
  userId,
  venueId,
  policyName,
  policyDescription,
}: {
  access: ManagementAccessPermission[];
  entityId: string;
  resources: string[];
  resourcePermissions?: ManagementResourceAccess[];
  roleTemplate: ManagementRoleTemplate;
  scope: ManagementScope;
  userId: string;
  venueId?: string;
  policyName?: string;
  policyDescription?: string;
}): ManagementPolicyRequest => ({
  entries: buildManagementPolicyEntries({
    access,
    entityId,
    resources,
    resourcePermissions,
    scope,
    userId,
  }),
  entity: entityId,
  venue: venueId ?? "",
  ...(policyName ? { name: policyName } : {}),
  ...(policyDescription ? { description: policyDescription } : {}),
});

export const buildManagementRolePayload = ({
  entityId,
  roleTemplate,
  scope,
  userEmail,
  userId,
  policyId,
  venueId,
}: {
  entityId: string;
  policyId: string;
  roleTemplate: ManagementRoleTemplate;
  scope: ManagementScope;
  userEmail: string;
  userId: string;
  venueId?: string;
}): ManagementRoleRequest => {
  const template = buildTemplateContext(scope, roleTemplate);

  return {
    name: `${template.namePrefix} - ${userEmail}`,
    description: template.description,
    managementPolicy: policyId,
    users: [userId],
    entity: entityId,
    venue: scope === "venue" ? venueId ?? "" : "",
  };
};

export const getManagementPolicies = async () => {
  checkProvServiceUrl();
  const res = await fetch(`${OWPROV_URL}/api/v1/managementPolicy`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch management policies.");
  const data = await res.json();
  return (data.managementPolicies ?? []) as ManagementPolicyApiResponse[];
};

export const getManagementRoles = async ({ entityId, venueId }: { entityId: string; venueId?: string }) => {
  checkProvServiceUrl();
  const venueQuery = venueId !== undefined ? `&venue=${encodeURIComponent(venueId)}` : "&venue=";
  const res = await fetch(`${OWPROV_URL}/api/v1/managementRole?entity=${encodeURIComponent(entityId)}${venueQuery}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch management roles.");
  const data = await res.json();
  return getCollection<ManagementRoleApiResponse>(data, [
    "managementRoles",
    "roles",
    "entries",
    "managementRole",
  ]);
};

export const getManagementRoleForUserEntity = async ({
  entityId,
  userId,
  venueId,
}: {
  entityId: string;
  userId: string;
  venueId?: string;
}) => {
  checkProvServiceUrl();
  const venueQuery = venueId !== undefined ? `&venue=${encodeURIComponent(venueId)}` : "";
  const res = await fetch(
    `${OWPROV_URL}/api/v1/managementRole?userId=${encodeURIComponent(userId)}&entityId=${encodeURIComponent(entityId)}${venueQuery}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
  if (!res.ok) throw new Error("Failed to fetch user management role.");
  const data = await res.json();
  return getCollection<ManagementRoleApiResponse>(data, [
    "managementRoles",
    "roles",
    "entries",
    "managementRole",
  ]);
};

export const getManagementPolicyById = async ({ policyId }: { policyId: string }): Promise<ManagementPolicyApiResponse | null> => {
  checkProvServiceUrl();
  const res = await fetch(`${OWPROV_URL}/api/v1/managementPolicy/${encodeURIComponent(policyId)}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch management policy.");
  const data = await res.json();
  if (typeof data === "object" && data !== null && "managementPolicy" in data && data.managementPolicy) {
    return data.managementPolicy;
  }
  return data as ManagementPolicyApiResponse;
};

export const deleteManagementPolicy = async (policyId: string) => {
  checkProvServiceUrl();
  const res = await fetch(`${OWPROV_URL}/api/v1/managementPolicy/${encodeURIComponent(policyId)}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete management policy.");
};

export const getManagementRolesForUser = async ({ userId }: { userId: string }) => {
  checkProvServiceUrl();
  const res = await fetch(`${OWPROV_URL}/api/v1/managementRole?userId=${encodeURIComponent(userId)}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch management roles for user.");
  const data = await res.json();
  return getCollection<ManagementRoleApiResponse>(data, [
    "managementRoles",
    "roles",
    "entries",
    "managementRole",
  ]);
};

export const getVenues = async () => {
  checkProvServiceUrl();
  const res = await fetch(`${OWPROV_URL}/api/v1/venue`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch venues from Provisioning service.");
  const data = await res.json();
  return getCollection<any>(data, ["venues"]);
};

export const getMatchingManagementPolicy = (
  policies: ManagementPolicyApiResponse[],
  {
    access,
    entityId,
    roleTemplate,
    resources,
    scope,
    venueId,
  }: {
    access: ManagementAccessPermission[];
    entityId: string;
    resources: string[];
    roleTemplate: ManagementRoleTemplate;
    scope: ManagementScope;
    venueId?: string;
  }
) => {
  const desiredPolicy = buildManagementPolicyPayload({
    access,
    entityId,
    resources,
    roleTemplate,
    scope,
    userId: "",
    venueId,
  });

  return policies.find((policy) => {
    const policyEntries = policy.entries ?? [];
    if (policy.entity !== desiredPolicy.entity) return false;
    if ((policy.venue ?? "") !== (desiredPolicy.venue ?? "")) return false;
    if (policyEntries.length < desiredPolicy.entries.length) return false;

    return desiredPolicy.entries.every((desiredEntry) =>
      policyEntries.some((entry) => {
        const parsedPolicy = parsePolicyScope(entry.policy ?? "");
        return (
          parsedPolicy.scope === scope &&
          parsedPolicy.entityId === entityId &&
          parsedPolicy.includeVenues === true &&
          parsedPolicy.includeChildEntities === true &&
          desiredEntry.access.every((perm) => entry.access.includes(perm)) &&
          desiredEntry.resources.every((resource) => entry.resources.includes(resource))
        );
      })
    );
  });
};

export const getExistingManagementPolicyForUser = (
  policies: ManagementPolicyApiResponse[],
  {
    entityId,
    scope,
    userId,
    venueId,
  }: {
    entityId: string;
    scope: ManagementScope;
    userId: string;
    venueId?: string;
  }
) => {
  const desiredVenue = scope === "venue" ? venueId ?? "" : "";

  return policies.find((policy) => {
    if (policy.entity !== entityId) return false;
    if ((policy.venue ?? "") !== desiredVenue) return false;

    return (policy.entries ?? []).some((entry) => {
      const parsedPolicy = parsePolicyScope(entry.policy ?? "");
      return parsedPolicy.scope === scope && parsedPolicy.entityId === entityId && (entry.users ?? []).includes(userId);
    });
  });
};

export const getMatchingManagementRole = (
  roles: ManagementRoleApiResponse[],
  {
    entityId,
    policyId,
    scope,
    venueId,
  }: {
    entityId: string;
    policyId: string;
    scope: ManagementScope;
    venueId?: string;
  }
) =>
  roles.find((role) => {
    const desiredVenue = scope === "venue" ? venueId ?? "" : "";
    return (
      role.entity === entityId &&
      (role.venue ?? "") === desiredVenue &&
      (role.managementPolicyId ?? role.managementPolicy) === policyId
    );
  });

type NormalizedPermission = {
  user: string;
  scope: string;
  entityId: string;
  resource: string;
  access: ManagementAccessPermission[];
  policyContext: string;
};

const normalizeEntries = (entries: ManagementPolicyEntry[]): NormalizedPermission[] => {
  const result: NormalizedPermission[] = [];
  for (const entry of entries) {
    const parsed = parsePolicyScope(entry.policy ?? "");
    for (const user of entry.users ?? []) {
      for (const resource of entry.resources ?? []) {
        result.push({
          user,
          scope: parsed.scope,
          entityId: parsed.entityId,
          resource,
          access: entry.access ?? [],
          policyContext: entry.policy ?? "",
        });
      }
    }
  }
  return result;
};

export const mergePolicyEntries = (
  existingEntries: ManagementPolicyEntry[],
  targetEntries: ManagementPolicyEntry[],
  userId: string,
  replacementPolicyContext?: string
): ManagementPolicyEntry[] => {
  const existingRules = normalizeEntries(existingEntries);
  const targetRules = normalizeEntries(targetEntries);

  const targetPolicyContexts = new Set(targetRules.map((r) => r.policyContext));
  const targetScopes = new Set(targetRules.map((r) => r.scope));
  const targetEntityIds = new Set(targetRules.map((r) => r.entityId));

  const preservedRules = existingRules.filter((rule) => {
    if (rule.user !== userId) return true;

    if (targetPolicyContexts.size > 0 || replacementPolicyContext) {
      return !targetPolicyContexts.has(rule.policyContext) && rule.policyContext !== replacementPolicyContext;
    }

    if (targetScopes.size > 0 || targetEntityIds.size > 0) {
      return !targetScopes.has(rule.scope) || !targetEntityIds.has(rule.entityId);
    }

    return true;
  });

  const mergedRules = [...preservedRules, ...targetRules];

  const userGroups = new Map<
    string,
    { user: string; policyContext: string; access: ManagementAccessPermission[]; resources: Set<string> }
  >();
  for (const rule of mergedRules) {
    const accessKey = [...rule.access].sort().join(",");
    const key = `${rule.user}|||${rule.policyContext}|||${accessKey}`;
    const existing = userGroups.get(key);
    if (existing) {
      existing.resources.add(rule.resource);
    } else {
      userGroups.set(key, {
        user: rule.user,
        policyContext: rule.policyContext,
        access: rule.access,
        resources: new Set([rule.resource]),
      });
    }
  }

  const entryGroups = new Map<
    string,
    { users: Set<string>; resources: string[]; access: ManagementAccessPermission[]; policy: string }
  >();
  for (const group of userGroups.values()) {
    const sortedResources = [...group.resources].sort();
    const resourcesKey = sortedResources.join(",");
    const accessKey = [...group.access].sort().join(",");
    const key = `${resourcesKey}|||${group.policyContext}|||${accessKey}`;
    const existing = entryGroups.get(key);
    if (existing) {
      existing.users.add(group.user);
    } else {
      entryGroups.set(key, {
        users: new Set([group.user]),
        resources: sortedResources,
        access: group.access,
        policy: group.policyContext,
      });
    }
  }

  return [...entryGroups.values()].map((g) => ({
    users: [...g.users],
    resources: g.resources,
    access: g.access,
    policy: g.policy,
  }));
};

export const isPolicyShared = (
  policy: ManagementPolicyApiResponse,
  userId: string,
  currentRoleId?: string,
  allEntityRoles?: ManagementRoleApiResponse[]
): boolean => {
  const hasOtherUsers = (policy.entries ?? []).some((entry) => (entry.users ?? []).some((u) => u !== userId));
  if (hasOtherUsers) return true;

  if (allEntityRoles && currentRoleId) {
    const policyId = policy.id;
    const referencingRoles = allEntityRoles.filter((r) => (r.managementPolicyId ?? r.managementPolicy) === policyId);
    if (referencingRoles.some((r) => r.id !== currentRoleId)) {
      return true;
    }
  }

  return false;
};

const getReplacementPolicyContext = ({
  existingPolicy,
  fallbackEntityId,
  policyPayload,
  scope,
  userId,
}: {
  existingPolicy?: ManagementPolicyApiResponse;
  fallbackEntityId: string;
  policyPayload: ManagementPolicyRequest;
  scope: ManagementScope;
  userId: string;
}) => {
  const existingEntry = (existingPolicy?.entries ?? []).find((entry) => {
    const parsed = parsePolicyScope(entry.policy ?? "");
    return (entry.users ?? []).includes(userId) && parsed.scope === scope;
  });

  return (
    existingEntry?.policy ??
    policyPayload.entries[0]?.policy ??
    JSON.stringify(buildManagementPolicyContext({ entityId: fallbackEntityId, scope }))
  );
};

export const assignUserAccess = async ({
  access,
  entityId,
  resources,
  roleTemplate,
  scope,
  resourcePermissions,
  userEmail,
  userId,
  venueId,
  policyName,
  policyDescription,
}: AssignUserAccessInput): Promise<ManagementAccessResult> => {
  if (!entityId) {
    throw new Error("Entity could not be determined");
  }
  checkProvServiceUrl();

  const resolvedVenueId = scope === "venue" ? venueId ?? "" : "";
  const rolesForUser = await getManagementRoleForUserEntity({ entityId, userId });

  let existingRole: ManagementRoleApiResponse | undefined;
  let existingPolicy: ManagementPolicyApiResponse | undefined;

  const template = buildTemplateContext(scope, roleTemplate);
  const candidates = rolesForUser.filter((role) => role.entity === entityId && (role.venue ?? "") === resolvedVenueId);

  if (candidates.length > 0) {
    const policiesWithRoles = await Promise.all(
      candidates.map(async (role) => {
        const policyId = role.managementPolicyId ?? role.managementPolicy ?? "";
        if (!policyId) return { role, policy: undefined };
        const policy = await getManagementPolicyById({ policyId });
        return { role, policy };
      })
    );

    const matchingCandidate = policiesWithRoles.find(({ policy }) => {
      if (!policy) return false;
      if (scope === "venue" && (policy.venue ?? "") !== resolvedVenueId) return false;

      const hasMatchingScope = (policy.entries ?? []).some((entry) => {
        const parsed = parsePolicyScope(entry.policy ?? "");
        return parsed.scope === scope;
      });
      return hasMatchingScope;
    });

    if (matchingCandidate) {
      existingRole = matchingCandidate.role;
      existingPolicy = matchingCandidate.policy ?? undefined;
    }
  }

  let isSafeToUpdate = false;
  if (existingRole && existingPolicy) {
    const allEntityRoles = await getManagementRoles({
      entityId,
      venueId: resolvedVenueId || undefined,
    });
    const isShared = isPolicyShared(existingPolicy, userId, existingRole.id, allEntityRoles);
    isSafeToUpdate = !isShared;
  }

  const existingPolicyId = existingRole?.managementPolicyId ?? existingRole?.managementPolicy ?? "";
  const policyEntityId = existingPolicy?.entity ?? entityId;
  const policyVenueId = existingPolicy?.venue ?? resolvedVenueId;

  const resolvedAccess = template.access;
  const resolvedResources = ["*"];
  const resolvedResourcePermissions = resourcePermissions && resourcePermissions.length > 0 ? resourcePermissions : undefined;

  const policyPayload = buildManagementPolicyPayload({
    access: resolvedAccess,
    entityId: policyEntityId,
    resources: resolvedResources,
    resourcePermissions: resolvedResourcePermissions,
    roleTemplate,
    scope,
    userId,
    venueId: policyVenueId || undefined,
    policyName,
    policyDescription,
  });

  let policyId = existingPolicy?.id ?? existingPolicyId ?? "";
  if (existingPolicy && policyId && isSafeToUpdate) {
    const mergedEntries = mergePolicyEntries(
      existingPolicy.entries ?? [],
      policyPayload.entries,
      userId,
      getReplacementPolicyContext({
        existingPolicy,
        fallbackEntityId: policyEntityId,
        policyPayload,
        scope,
        userId,
      })
    );
    const updatedPolicyPayload = {
      ...policyPayload,
      entries: mergedEntries,
    };

    const putRes = await fetch(`${OWPROV_URL}/api/v1/managementPolicy/${encodeURIComponent(policyId)}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(updatedPolicyPayload),
    });
    if (!putRes.ok) throw new Error("Failed to update existing management policy.");
  } else {
    const newPolicyId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" 
      ? crypto.randomUUID() 
      : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
    const postRes = await fetch(`${OWPROV_URL}/api/v1/managementPolicy/${encodeURIComponent(newPolicyId)}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(policyPayload),
    });
    if (!postRes.ok) throw new Error("Failed to create management policy.");
    const createdPolicyData = await postRes.json();
    policyId = createdPolicyData.id ?? createdPolicyData.managementPolicy ?? createdPolicyData.managementPolicyId ?? newPolicyId;
  }

  if (!policyId) {
    throw new Error("Management policy could not be created");
  }

  if (existingRole) {
    if (isSafeToUpdate) {
      const nextUsers = Array.from(new Set([...(existingRole.users ?? []), userId]));
      const rolePolicyId = existingRole.managementPolicyId ?? existingRole.managementPolicy ?? "";
      const roleUpdated = nextUsers.length !== (existingRole.users ?? []).length || rolePolicyId !== policyId;

      if (roleUpdated) {
        const putRoleRes = await fetch(`${OWPROV_URL}/api/v1/managementRole/${encodeURIComponent(existingRole.id)}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({
            name: existingRole.name,
            description: existingRole.description,
            managementPolicy: policyId,
            users: nextUsers,
            venue: resolvedVenueId || "",
            entity: entityId,
          }),
        });
        if (!putRoleRes.ok) throw new Error("Failed to update user management role.");
      }

      return {
        entityId,
        policyId,
        roleId: existingRole.id,
        roleUpdated,
        venueId: resolvedVenueId,
      };
    }

    const nextUsers = (existingRole.users ?? []).filter((u) => u !== userId);
    const putPrevRole = await fetch(`${OWPROV_URL}/api/v1/managementRole/${encodeURIComponent(existingRole.id)}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        name: existingRole.name,
        description: existingRole.description,
        managementPolicy: existingRole.managementPolicyId ?? existingRole.managementPolicy ?? "",
        users: nextUsers,
        venue: resolvedVenueId || "",
        entity: entityId,
      }),
    });
    if (!putPrevRole.ok) throw new Error("Failed to split role context.");

    const postRoleRes = await fetch(`${OWPROV_URL}/api/v1/managementRole/create`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(
        buildManagementRolePayload({
          entityId,
          policyId,
          roleTemplate,
          scope,
          userEmail,
          userId,
          venueId: resolvedVenueId || undefined,
        })
      ),
    });
    if (!postRoleRes.ok) throw new Error("Failed to create management role.");
    const createdRoleData = await postRoleRes.json();
    const newRoleId = createdRoleData.id ?? createdRoleData.managementRole ?? createdRoleData.managementRoleId ?? "";

    return {
      entityId,
      policyId,
      roleId: newRoleId,
      roleUpdated: true,
      venueId: resolvedVenueId,
    };
  }

  const postRoleRes = await fetch(`${OWPROV_URL}/api/v1/managementRole/create`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(
      buildManagementRolePayload({
        entityId,
        policyId,
        roleTemplate,
        scope,
        userEmail,
        userId,
        venueId: resolvedVenueId || undefined,
      })
    ),
  });
  if (!postRoleRes.ok) throw new Error("Failed to create management role mapping.");
  const createdRoleData = await postRoleRes.json();
  const roleId = createdRoleData.id ?? createdRoleData.managementRole ?? createdRoleData.managementRoleId ?? "";

  return {
    entityId,
    policyId,
    roleId,
    roleUpdated: true,
    venueId: resolvedVenueId,
  };
};

export const getEntities = async () => {
  checkProvServiceUrl();
  const res = await fetch(`${OWPROV_URL}/api/v1/entity?withExtendedInfo=true`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch entities.");
  const data = await res.json();
  return getCollection<any>(data, ["entities"]);
};

export const createManagementPolicy = async (payload: ManagementPolicyApiResponse) => {
  checkProvServiceUrl();
  const res = await fetch(`${OWPROV_URL}/api/v1/managementPolicy/${encodeURIComponent(payload.id)}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create management policy.");
  return res.json() as Promise<ManagementPolicyApiResponse>;
};

export const updateManagementPolicy = async (payload: ManagementPolicyApiResponse) => {
  checkProvServiceUrl();
  const res = await fetch(`${OWPROV_URL}/api/v1/managementPolicy/${encodeURIComponent(payload.id)}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update management policy.");
  return res.json() as Promise<ManagementPolicyApiResponse>;
};

export const createManagementRole = async (payload: any) => {
  checkProvServiceUrl();
  const res = await fetch(`${OWPROV_URL}/api/v1/managementRole/${encodeURIComponent(payload.id)}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create management role mapping.");
  return res.json();
};

export const updateManagementRole = async (payload: any) => {
  checkProvServiceUrl();
  const res = await fetch(`${OWPROV_URL}/api/v1/managementRole/${encodeURIComponent(payload.id)}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update management role mapping.");
  return res.json();
};

export const deleteManagementRole = async (roleId: string) => {
  checkProvServiceUrl();
  const res = await fetch(`${OWPROV_URL}/api/v1/managementRole/${encodeURIComponent(roleId)}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete management role mapping.");
  return res.status === 204 ? null : res.json().catch(() => null);
};

