"use client";

import Link from "next/link";
import { LogOut, Menu, Search, ShieldCheck, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AdminTopBarProps = {
  onMenuClick: () => void;
  userInitials: string;
  userEmail: string;
};

export function AdminTopBar({ onMenuClick, userInitials, userEmail }: AdminTopBarProps) {
  const router = useRouter();
  const [online, setOnline] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Client-side sign-out so it works offline: clears the persisted session
  // (and the auth cookies) locally. AuthGate then routes to /login.
  const handleSignOut = async () => {
    setMenuOpen(false);
    await getSupabaseBrowserClient().auth.signOut();
    router.replace("/login");
  };

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/10 bg-background/85 px-4 backdrop-blur-xl sm:px-6">
      <button
        type="button"
        className="grid size-10 place-items-center rounded-md border border-white/15 bg-white/5 text-white lg:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu size={20} aria-hidden />
      </button>

      <div className="relative flex-1 max-w-lg">
        <Search
          size={16}
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          placeholder="Search customers, vehicles, jobs…"
          className="focus-field !py-2 pl-9 text-sm"
          aria-label="Global search"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        {!online ? (
          <span
            className="inline-flex items-center gap-2 rounded-full border border-cfg-orange/40 bg-cfg-orange/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cfg-orange"
            role="status"
          >
            <WifiOff size={14} aria-hidden />
            Offline
          </span>
        ) : null}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="grid size-9 place-items-center rounded-full border border-white/15 bg-white/5 text-xs font-bold uppercase tracking-wide text-white transition hover:border-blue-accent"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`Account menu for ${userEmail}`}
          >
            {userInitials}
          </button>
          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-11 w-64 overflow-hidden rounded-md border border-white/10 bg-panel shadow-2xl shadow-black/40"
            >
              <div className="border-b border-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Signed in</p>
                <p className="truncate text-sm text-text">{userEmail}</p>
              </div>
              <Link
                href="/admin/security"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-text transition hover:bg-white/5"
              >
                <ShieldCheck size={16} aria-hidden />
                Security
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-text transition hover:bg-white/5"
              >
                <LogOut size={16} aria-hidden />
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
