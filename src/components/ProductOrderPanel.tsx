"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, PackageCheck, ShieldCheck, Wrench } from "lucide-react";
import type { Product } from "@/types/content";
import { cn } from "@/lib/utils";

type ProductOrderPanelProps = {
  product: Product;
};

function getInitialSelections(product: Product) {
  return Object.fromEntries(
    product.options.map((option) => [option.label, option.values[0] ?? ""]),
  );
}

export function ProductOrderPanel({ product }: ProductOrderPanelProps) {
  const defaultMode = product.shipModes.includes("shop-install") ? "shop-install" : "customer";
  const [shipMode, setShipMode] = useState<"customer" | "shop-install">(defaultMode);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() =>
    getInitialSelections(product),
  );
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setShipMode(defaultMode);
    setSelectedOptions(getInitialSelections(product));
    setNotes("");
    setQuantity(1);
    setSubmitted(false);
  }, [defaultMode, product]);

  const routeSummary = useMemo(() => {
    if (shipMode === "shop-install") {
      return {
        title: "Ship To Forged Customs For Install",
        body: "Product ships to the company, fitment is reviewed, and install scheduling is handled with the build quote.",
        icon: Wrench,
      };
    }

    return {
      title: "Ship To Customer",
      body: "Product ships to the customer shipping address. Install can still be requested as a separate quote.",
      icon: PackageCheck,
    };
  }, [shipMode]);

  const Icon = routeSummary.icon;

  if (submitted) {
    return (
      <div className="rounded-lg border border-white/10 bg-panel p-6 shadow-2xl shadow-black/30">
        <CheckCircle2 size={42} className="text-blue-accent" aria-hidden />
        <h2 className="mt-5 font-heading text-4xl uppercase leading-none text-white">
          Product request captured.
        </h2>
        <p className="mt-4 text-sm leading-6 text-muted">
          In production this would create a checkout session, install quote, or hybrid order depending on product fitment and shipping route.
        </p>
        <div className="mt-6 rounded-lg border border-white/10 bg-black/30 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-accent">
            Request Summary
          </p>
          <div className="mt-4 grid gap-2 text-sm leading-6 text-muted">
            <p>
              <span className="text-white">Quantity:</span> {quantity}
            </p>
            <p>
              <span className="text-white">Routing:</span> {routeSummary.title}
            </p>
            {Object.entries(selectedOptions).map(([label, value]) => (
              <p key={label}>
                <span className="text-white">{label}:</span> {value}
              </p>
            ))}
            {notes ? (
              <p>
                <span className="text-white">Paint codes and notes:</span> {notes}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside className="rounded-lg border border-white/10 bg-panel p-6 shadow-2xl shadow-black/30">
      <p className="eyebrow">Order Routing</p>
      <h2 className="mt-3 font-heading text-4xl uppercase leading-none text-white">
        {product.price}
      </h2>
      <p className="mt-2 text-sm font-semibold text-blue-accent">{product.installEstimate}</p>

      <div className="mt-6 grid gap-3">
        <button
          type="button"
          disabled={!product.shipModes.includes("customer")}
          onClick={() => setShipMode("customer")}
          className={cn(
            "rounded-md border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-35",
            shipMode === "customer"
              ? "border-blue-accent bg-blue-accent/12"
              : "border-white/10 bg-white/5 hover:border-blue-accent/70",
          )}
        >
          <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-white">
            <PackageCheck size={18} aria-hidden />
            Ship To Customer
          </span>
          <span className="mt-2 block text-sm leading-6 text-muted">
            Customer receives the product and can request installation separately.
          </span>
        </button>

        <button
          type="button"
          disabled={!product.shipModes.includes("shop-install")}
          onClick={() => setShipMode("shop-install")}
          className={cn(
            "rounded-md border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-35",
            shipMode === "shop-install"
              ? "border-accent bg-accent/15"
              : "border-white/10 bg-white/5 hover:border-accent/70",
          )}
        >
          <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-white">
            <Wrench size={18} aria-hidden />
            Ship To Shop For Install
          </span>
          <span className="mt-2 block text-sm leading-6 text-muted">
            Product routes to Forged Customs and is tied to an install quote.
          </span>
        </button>
      </div>

      <div className="mt-6 rounded-lg border border-white/10 bg-black/30 p-4">
        <Icon size={24} className="text-blue-accent" aria-hidden />
        <p className="mt-3 font-bold text-white">{routeSummary.title}</p>
        <p className="mt-2 text-sm leading-6 text-muted">{routeSummary.body}</p>
      </div>

      {product.options.length ? (
        <div className="mt-6 rounded-lg border border-white/10 bg-black/25 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white">
            Build Options
          </p>
          <div className="mt-4 grid gap-4">
            {product.options.map((option) => (
              <label key={option.label} className="grid gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
                  {option.label}
                </span>
                <select
                  className="focus-field"
                  value={selectedOptions[option.label] ?? ""}
                  onChange={(event) =>
                    setSelectedOptions((current) => ({
                      ...current,
                      [option.label]: event.target.value,
                    }))
                  }
                >
                  {option.values.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
                Paint Codes & Notes
              </span>
              <textarea
                className="focus-field min-h-24 resize-y"
                maxLength={500}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Paint code, trim notes, customer-supplied parts, timing, or special requests"
              />
              <span className="text-right text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted">
                {notes.length}/500
              </span>
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
                Quantity
              </span>
              <input
                className="focus-field"
                type="number"
                min={1}
                max={12}
                value={quantity}
                onChange={(event) =>
                  setQuantity(Math.max(1, Math.min(12, Number(event.target.value) || 1)))
                }
              />
            </label>
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-muted">
        <ShieldCheck size={20} className="mt-0.5 shrink-0 text-blue-accent" aria-hidden />
        <p>
          Final checkout should validate fitment, taxes, shipping rates, installation requirements, vendor lead time, and return policy.
        </p>
      </div>

      <button type="button" className="cta-primary mt-6 w-full" onClick={() => setSubmitted(true)}>
        Continue Request
      </button>
    </aside>
  );
}
