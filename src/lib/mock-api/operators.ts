import type { Operator } from "@/types/operator";

import { getServiceUrl, checkServiceUrl, getHeaders } from "@/lib/api/config";

const OWPROV_URL = getServiceUrl("provisioning");

function checkProvServiceUrl() {
  checkServiceUrl("provisioning");
}

export async function getOperators(): Promise<Operator[]> {
  checkProvServiceUrl();

  const res = await fetch(`${OWPROV_URL}/api/v1/operator?withExtendedInfo=true`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.ErrorDescription || "Failed to fetch operators from Provisioning service.");
  }

  const data = await res.json();
  return data.operators || [];
}

export async function getOperatorById(id: string): Promise<Operator> {
  checkProvServiceUrl();

  const res = await fetch(`${OWPROV_URL}/api/v1/operator/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Operator not found.");
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.ErrorDescription || "Failed to fetch operator details.");
  }

  return res.json();
}

export async function createOperator(payload: {
  name: string;
  registrationId: string;
  description?: string;
  deviceRules?: {
    firmwareUpgrade: string;
    rcOnly: string;
    rrm: string;
  };
  sourceIP?: string[];
  firmwareRCOnly?: boolean;
}): Promise<Operator> {
  checkProvServiceUrl();

  // Standard creation POST to operator/1 in OpenWifi Provisioning C++ schema
  const res = await fetch(`${OWPROV_URL}/api/v1/operator/1`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      name: payload.name,
      registrationId: payload.registrationId,
      description: payload.description || undefined,
      deviceRules: payload.deviceRules || { firmwareUpgrade: "inherit", rcOnly: "inherit", rrm: "inherit" },
      sourceIP: payload.sourceIP || [],
      firmwareRCOnly: payload.firmwareRCOnly !== undefined ? payload.firmwareRCOnly : false,
      notes: [],
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.ErrorDescription || "Failed to create operator.");
  }

  return res.json();
}

export async function updateOperator(
  id: string,
  payload: {
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
  }
): Promise<Operator> {
  checkProvServiceUrl();

  const res = await fetch(`${OWPROV_URL}/api/v1/operator/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.ErrorDescription || "Failed to update operator.");
  }

  return res.json();
}

export async function deleteOperator(id: string): Promise<boolean> {
  checkProvServiceUrl();

  const res = await fetch(`${OWPROV_URL}/api/v1/operator/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.ErrorDescription || "Failed to delete operator.");
  }

  return true;
}
