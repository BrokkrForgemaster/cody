"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import type { Invoice, InvoiceLineItem, InvoiceStatus, Vehicle } from "@/lib/supabase/types";

export type { Invoice, InvoiceLineItem, InvoiceStatus };

export type InvoiceWithCustomer = Invoice & {
  customer_first_name: string | null;
  customer_last_name: string | null;
};

export type FullInvoice = Invoice & {
  line_items: InvoiceLineItem[];
};

async function nextInvoiceNumber(): Promise<string> {
  const supabase = getSupabaseServiceClient();
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const { count } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .like("invoice_number", `${prefix}%`)
    .is("deleted_at", null);
  const seq = String((count ?? 0) + 1).padStart(3, "0");
  return `${prefix}${seq}`;
}

export async function listInvoices(): Promise<InvoiceWithCustomer[]> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*, customers(first_name, last_name)")
    .is("deleted_at", null)
    .order("issue_date", { ascending: false });
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const { customers, ...inv } = row as Invoice & {
      customers: { first_name: string; last_name: string } | null;
    };
    return {
      ...inv,
      customer_first_name: customers?.first_name ?? null,
      customer_last_name: customers?.last_name ?? null,
    };
  });
}

export async function getInvoice(id: string): Promise<FullInvoice | null> {
  const supabase = getSupabaseServiceClient();
  const { data: inv, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  if (error || !inv) return null;

  const { data: items } = await supabase
    .from("invoice_line_items")
    .select("*")
    .eq("invoice_id", id)
    .order("sort_order");

  return { ...(inv as Invoice), line_items: (items ?? []) as InvoiceLineItem[] };
}

export async function createInvoice(): Promise<string> {
  const supabase = getSupabaseServiceClient();
  const invoice_number = await nextInvoiceNumber();
  const { data, error } = await supabase
    .from("invoices")
    .insert({ invoice_number })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to create invoice.");
  revalidatePath("/admin/invoices");
  return data.id;
}

export type SavePayload = {
  id: string;
  customerId: string;
  vehicleId: string;
  jobId: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  notes: string;
  internalNotes: string;
  shopFeeLabel: string;
  shopFeeCents: number;
  shopFeeTaxable: boolean;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  items: {
    description: string;
    quantity: number;
    unitPriceCents: number;
    amountCents: number;
    taxable: boolean;
    sortOrder: number;
  }[];
};

export async function saveInvoice(payload: SavePayload): Promise<void> {
  const supabase = getSupabaseServiceClient();

  const { error: invErr } = await supabase
    .from("invoices")
    .update({
      customer_id:      payload.customerId     || null,
      vehicle_id:       payload.vehicleId      || null,
      job_id:           payload.jobId          || null,
      status:           payload.status,
      issue_date:       payload.issueDate,
      due_date:         payload.dueDate        || null,
      notes:            payload.notes          || null,
      internal_notes:   payload.internalNotes  || null,
      shop_fee_label:   payload.shopFeeLabel,
      shop_fee_cents:   payload.shopFeeCents,
      shop_fee_taxable: payload.shopFeeTaxable,
      subtotal_cents:   payload.subtotalCents,
      tax_cents:        payload.taxCents,
      total_cents:      payload.totalCents,
      paid_on: payload.status === "paid" ? new Date().toISOString().slice(0, 10) : null,
    })
    .eq("id", payload.id);
  if (invErr) throw new Error(invErr.message);

  const { error: delErr } = await supabase
    .from("invoice_line_items")
    .delete()
    .eq("invoice_id", payload.id);
  if (delErr) throw new Error(delErr.message);

  if (payload.items.length > 0) {
    const { error: insErr } = await supabase.from("invoice_line_items").insert(
      payload.items.map((item) => ({
        invoice_id:       payload.id,
        sort_order:       item.sortOrder,
        description:      item.description,
        quantity:         item.quantity,
        unit_price_cents: item.unitPriceCents,
        amount_cents:     item.amountCents,
        taxable:          item.taxable,
      })),
    );
    if (insErr) throw new Error(insErr.message);
  }

  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/invoices/${payload.id}`);
}

export async function deleteInvoice(id: string): Promise<void> {
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase
    .from("invoices")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/invoices");
}

export async function listCustomers(): Promise<
  { id: string; first_name: string; last_name: string; email: string | null; phone: string | null }[]
> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id, first_name, last_name, email, phone")
    .is("deleted_at", null)
    .order("last_name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listCustomerVehicles(customerId: string): Promise<Vehicle[]> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("customer_id", customerId)
    .is("deleted_at", null)
    .order("year", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Vehicle[];
}
