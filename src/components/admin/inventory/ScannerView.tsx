"use client";

import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { AlertTriangle, Camera, CameraOff, Loader2, Plus, ScanLine } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { findPartByBarcode } from "@/lib/offline/parts";
import type { Part } from "@/lib/supabase/types";

type ScanResult =
  | { status: "idle" }
  | { status: "found"; code: string; part: Part }
  | { status: "not-found"; code: string };

export function ScannerView() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<"pending" | "granted" | "denied">("pending");
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult>({ status: "idle" });
  const [manualCode, setManualCode] = useState("");
  const [autoOpen, setAutoOpen] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const reader = new BrowserMultiFormatReader();

    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setError("This browser doesn't support camera access.");
          setPermission("denied");
          return;
        }
        setPermission("pending");
        if (!videoRef.current) return;
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          async (result) => {
            if (!result || cancelled) return;
            const code = result.getText().trim();
            if (!code) return;
            if (code === lastCode) return;
            setLastCode(code);
            await handleCode(code);
          },
        );
        controlsRef.current = controls;
        setPermission("granted");
      } catch (err) {
        console.warn("[scanner] start failed", err);
        setError(err instanceof Error ? err.message : "Camera unavailable.");
        setPermission("denied");
      }
    }

    void start();
    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCode(code: string) {
    const part = await findPartByBarcode(code);
    if (part) {
      setResult({ status: "found", code, part });
      if (autoOpen) router.push(`/admin/inventory/${part.id}`);
    } else {
      setResult({ status: "not-found", code });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          Point the camera at a barcode. Held steady, it will auto-detect.
        </p>
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          <input
            type="checkbox"
            checked={autoOpen}
            onChange={(e) => setAutoOpen(e.target.checked)}
            className="accent-accent"
          />
          Auto-open on scan
        </label>
      </div>

      <div className="panel-border relative overflow-hidden rounded-lg">
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          className="aspect-[4/3] w-full bg-black object-cover"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-2/3 w-4/5 rounded-lg border-2 border-accent/60 shadow-[0_0_25px_rgba(193,18,31,0.45)]" />
        </div>
        {permission === "pending" ? (
          <div className="absolute inset-0 grid place-items-center bg-black/50 text-sm text-muted">
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={20} className="animate-spin" aria-hidden />
              Requesting camera…
            </div>
          </div>
        ) : null}
        {permission === "denied" ? (
          <div className="absolute inset-0 grid place-items-center bg-black/70 p-6 text-center text-sm text-muted">
            <div className="flex flex-col items-center gap-3">
              <CameraOff size={26} className="text-accent" aria-hidden />
              <p className="max-w-md">
                Camera not available. Grant permission in your browser, or use the manual entry
                below.
              </p>
              {error ? <p className="text-xs text-muted">{error}</p> : null}
            </div>
          </div>
        ) : null}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const code = manualCode.trim();
          if (!code) return;
          setLastCode(code);
          void handleCode(code);
          setManualCode("");
        }}
        className="panel-border flex gap-2 rounded-lg p-4"
      >
        <input
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          className="focus-field !py-2 text-sm"
          placeholder="Or type a SKU / barcode"
          aria-label="Manual code entry"
        />
        <button type="submit" className="cta-secondary text-xs">
          <ScanLine size={14} aria-hidden />
          Lookup
        </button>
      </form>

      {result.status === "found" ? (
        <div className="panel-border rounded-lg border-emerald-400/30 bg-emerald-400/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Found
          </p>
          <p className="mt-1 font-semibold text-text">{result.part.name}</p>
          <p className="text-xs text-muted">
            {result.part.sku} · on hand {result.part.on_hand} {result.part.uom}
          </p>
          <div className="mt-3 flex gap-2">
            <Link
              href={`/admin/inventory/${result.part.id}`}
              className="cta-primary text-xs"
            >
              Open part
            </Link>
            <button
              type="button"
              className="cta-secondary text-xs"
              onClick={() => {
                setResult({ status: "idle" });
                setLastCode(null);
              }}
            >
              Scan another
            </button>
          </div>
        </div>
      ) : null}

      {result.status === "not-found" ? (
        <div className="panel-border rounded-lg border-cfg-orange/40 bg-cfg-orange/5 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 text-cfg-orange" aria-hidden />
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cfg-orange">
                Not found
              </p>
              <p className="mt-1 text-sm text-text">
                No part matches barcode <span className="font-mono">{result.code}</span>.
              </p>
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/admin/inventory/new?barcode=${encodeURIComponent(result.code)}`}
                  className="cta-primary text-xs"
                >
                  <Plus size={14} aria-hidden />
                  Add new part
                </Link>
                <button
                  type="button"
                  className="cta-secondary text-xs"
                  onClick={() => {
                    setResult({ status: "idle" });
                    setLastCode(null);
                  }}
                >
                  Scan another
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {result.status === "idle" && permission === "granted" ? (
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted">
          <Camera size={12} aria-hidden />
          Waiting for barcode…
        </p>
      ) : null}
    </div>
  );
}
