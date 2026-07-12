import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "./actions";

const STYLES: Record<InvoiceStatus, string> = {
  draft: "border-white/20 bg-white/5 text-muted",
  sent:  "border-blue-accent/50 bg-blue-accent/10 text-blue-accent",
  paid:  "border-emerald-400/50 bg-emerald-400/10 text-emerald-300",
  void:  "border-white/10 bg-white/5 text-muted opacity-60",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]",
        STYLES[status],
      )}
    >
      {status}
    </span>
  );
}
