"use client";

import Link from "next/link";
import { Search, UserPlus, Users } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo, useState } from "react";
import { listCustomers } from "@/lib/offline/customers";

function fmtPhone(phone: string | null): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function CustomersList() {
  const [q, setQ] = useState("");
  const customers = useLiveQuery(() => listCustomers(), []);

  const filtered = useMemo(() => {
    if (!customers) return [];
    if (!q.trim()) return customers;
    const needle = q.toLowerCase();
    return customers.filter((c) => {
      const hay = [
        c.first_name,
        c.last_name,
        c.email ?? "",
        c.phone ?? "",
        c.notes ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [customers, q]);

  const loading = customers === undefined;
  const empty = !loading && customers?.length === 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search
            size={16}
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, phone…"
            className="focus-field !py-2 pl-9 text-sm"
            aria-label="Search customers"
          />
        </div>
        <Link href="/admin/customers/new" className="cta-primary">
          <UserPlus size={16} aria-hidden />
          New customer
        </Link>
      </div>

      {loading ? (
        <div className="panel-border rounded-lg p-10 text-center text-sm text-muted">
          Loading…
        </div>
      ) : empty ? (
        <div className="panel-border flex flex-col items-center gap-3 rounded-lg p-10 text-center">
          <Users size={28} className="text-blue-accent" aria-hidden />
          <p className="font-heading text-2xl uppercase text-text">No customers yet</p>
          <p className="max-w-sm text-sm text-muted">
            Add your first customer. If the DB is empty and you're expecting existing records,
            check that your Supabase migration ran and this device is online.
          </p>
          <Link href="/admin/customers/new" className="cta-primary mt-2">
            <UserPlus size={16} aria-hidden />
            Add customer
          </Link>
        </div>
      ) : (
        <div className="panel-border overflow-hidden rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="hidden px-4 py-3 text-left font-semibold sm:table-cell">Email</th>
                <th className="hidden px-4 py-3 text-left font-semibold md:table-cell">Phone</th>
                <th className="hidden px-4 py-3 text-left font-semibold lg:table-cell">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((c) => (
                <tr key={c.id} className="transition hover:bg-white/5">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="font-semibold text-text hover:text-blue-accent"
                    >
                      {c.last_name}, {c.first_name}
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 text-muted sm:table-cell">{c.email ?? "—"}</td>
                  <td className="hidden px-4 py-3 text-muted md:table-cell">
                    {fmtPhone(c.phone) || "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-muted lg:table-cell">{c.source ?? "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted">
                    No customers match "{q}".
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
