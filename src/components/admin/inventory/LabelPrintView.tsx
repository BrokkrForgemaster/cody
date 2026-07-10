"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { CheckSquare, Printer, Search, Square, X } from "lucide-react";
import { useMemo, useState } from "react";
import { listParts } from "@/lib/offline/parts";
import type { Part } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { LabelBarcode } from "./LabelBarcode";

/**
 * Label sheet — sized for Avery 5160 / 5163-style layouts
 * (30 labels per Letter sheet, 3 columns × 10 rows, 2.625" × 1" each).
 * The barcode uses the part's `barcode` if set, otherwise falls back to the SKU.
 */
export function LabelPrintView() {
  const parts = useLiveQuery(() => listParts(true), []);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copies, setCopies] = useState(1);

  const filtered = useMemo(() => {
    if (!parts) return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return parts;
    return parts.filter((p) => {
      const hay = [p.sku, p.barcode ?? "", p.name, p.vendor ?? "", p.location ?? ""]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [parts, q]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const chosen: Part[] = useMemo(() => {
    if (!parts) return [];
    const idset = selected;
    return parts.filter((p) => idset.has(p.id));
  }, [parts, selected]);

  const labels: { code: string; sku: string; name: string; key: string }[] = useMemo(() => {
    const rows: { code: string; sku: string; name: string; key: string }[] = [];
    for (const p of chosen) {
      const code = p.barcode?.trim() || p.sku;
      for (let i = 0; i < copies; i += 1) {
        rows.push({
          code,
          sku: p.sku,
          name: p.name,
          key: `${p.id}-${i}`,
        });
      }
    }
    return rows;
  }, [chosen, copies]);

  return (
    <div className="flex flex-col gap-4">
      <div className="print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-md">
            <Search
              size={16}
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search parts to add…"
              className="focus-field !py-2 pl-9 text-sm"
              aria-label="Search parts"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted">
              Copies
              <input
                type="number"
                min={1}
                max={30}
                value={copies}
                onChange={(e) => setCopies(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
                className="focus-field !w-16 !py-1 text-center"
              />
            </label>
            <button
              type="button"
              className="cta-secondary text-xs"
              onClick={() => setSelected(new Set())}
              disabled={selected.size === 0}
            >
              <X size={12} aria-hidden />
              Clear ({selected.size})
            </button>
            <button
              type="button"
              className="cta-primary text-xs"
              onClick={() => window.print()}
              disabled={labels.length === 0}
            >
              <Printer size={14} aria-hidden />
              Print ({labels.length})
            </button>
          </div>
        </div>

        <div className="panel-border mt-4 max-h-[420px] overflow-y-auto rounded-lg">
          <ul className="divide-y divide-white/5">
            {filtered.map((p) => {
              const on = selected.has(p.id);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => toggle(p.id)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2.5 text-left transition",
                      on ? "bg-white/5" : "hover:bg-white/5",
                    )}
                  >
                    {on ? (
                      <CheckSquare size={16} className="text-blue-accent" aria-hidden />
                    ) : (
                      <Square size={16} className="text-muted" aria-hidden />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text">{p.name}</p>
                      <p className="text-xs text-muted">
                        {p.sku}
                        {p.barcode && p.barcode !== p.sku ? ` · ${p.barcode}` : ""}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 ? (
              <li className="p-6 text-center text-sm text-muted">No matching parts.</li>
            ) : null}
          </ul>
        </div>
      </div>

      {/* Print preview / print target */}
      <div className="print-area">
        <div className="print-sheet">
          {labels.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted print:hidden">
              Select parts on the left to add labels to the sheet. Preview appears here.
            </p>
          ) : null}
          {labels.map((label) => (
            <div key={label.key} className="print-label">
              <div className="print-barcode">
                <LabelBarcode value={label.code} height={38} width={1.4} />
              </div>
              <div className="print-sku">{label.sku}</div>
              <div className="print-name">{label.name}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .print-area {
          background: white;
          color: black;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .print-sheet {
          display: grid;
          grid-template-columns: repeat(3, 2.625in);
          grid-auto-rows: 1in;
          gap: 0;
          justify-content: center;
        }
        .print-label {
          border: 1px dashed #999;
          padding: 0.08in 0.12in;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
        .print-barcode svg { max-width: 100%; height: 0.55in; }
        .print-sku { font-family: monospace; font-size: 9px; margin-top: 2px; }
        .print-name { font-size: 8px; color: #444; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
        @media print {
          body * { visibility: hidden !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area {
            position: absolute;
            top: 0.5in;
            left: 0.1875in;
            background: white;
            padding: 0;
            border: 0;
          }
          .print-label { border: 0; }
        }
      `}</style>
    </div>
  );
}
