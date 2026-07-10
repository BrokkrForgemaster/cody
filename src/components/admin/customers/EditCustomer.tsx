"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getCustomer } from "@/lib/offline/customers";
import { CustomerForm } from "./CustomerForm";

export function EditCustomer({ id }: { id: string }) {
  const customer = useLiveQuery(() => getCustomer(id), [id]);

  if (customer === undefined) {
    return <p className="text-sm text-muted">Loading…</p>;
  }
  if (!customer || customer.deleted_at) {
    return <p className="text-sm text-muted">Customer not found on this device.</p>;
  }

  return <CustomerForm mode="edit" initial={customer} />;
}
