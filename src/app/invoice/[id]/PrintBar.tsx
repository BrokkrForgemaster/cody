"use client";

import { Printer } from "lucide-react";

export function PrintBar({ invoiceNumber }: { invoiceNumber: string }) {
  return (
    <div className="flex items-center justify-between bg-gray-100 px-6 py-3 print:hidden">
      <p className="text-sm font-semibold text-gray-700">{invoiceNumber}</p>
      <button
        type="button"
        onClick={() => window.print()}
        className="flex items-center gap-2 rounded bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-700"
      >
        <Printer size={13} aria-hidden />
        Print / Save PDF
      </button>
    </div>
  );
}
