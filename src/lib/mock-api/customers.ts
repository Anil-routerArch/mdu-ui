import {
  assertCanAccess,
  createMockApiError,
  filterByScope,
  withMockApi,
} from "@/lib/mock-api/client";
import { mockCustomers } from "@/lib/mock-data/customers";
import type { Customer, CustomerSummary } from "@/types/customer";
import type { User } from "@/types/user";

export async function getCustomers(scopeId: string | null, user: User): Promise<Customer[]> {
  return withMockApi(() => {
    assertCanAccess(user, "view", "customers", scopeId);
    return filterByScope(mockCustomers, (customer) => customer.path, scopeId, user);
  });
}

export async function getCustomerById(
  customerId: string,
  user: User,
): Promise<Customer> {
  return withMockApi(() => {
    const customer = mockCustomers.find((item) => item.id === customerId);

    if (!customer) {
      throw createMockApiError("NOT_FOUND", "Customer not found.", { status: 404 });
    }

    assertCanAccess(user, "view", "customers", customer.path[0]?.id ?? null);

    if (
      filterByScope([customer], (item) => item.path, null, user).length === 0
    ) {
      throw createMockApiError("NO_PERMISSION", "Customer is outside allowed scope.", {
        status: 403,
      });
    }

    return customer;
  });
}

export async function getCustomerSummary(
  customerId: string,
  user: User,
): Promise<CustomerSummary> {
  return withMockApi(async () => {
    const customer = await getCustomerById(customerId, user);
    return customer.summary;
  });
}
