import type { Metadata } from "next";
import Image from "next/image";
import { siteSettings } from "@/data/siteSettings";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 flex items-center gap-3">
        <Image
          src={siteSettings.logoMark.src}
          alt={siteSettings.logoMark.alt}
          width={48}
          height={48}
          className="size-12 object-contain drop-shadow-[0_0_18px_rgba(193,18,31,0.35)]"
        />
        <div className="flex flex-col leading-tight">
          <span className="font-heading text-2xl uppercase tracking-wide text-text">
            {siteSettings.shortName}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-blue-accent">
            Shop Ops · Sign in
          </span>
        </div>
      </div>

      <div className="panel-border rounded-lg p-6">
        <LoginForm next={next ?? "/admin"} />
      </div>

      <p className="mt-6 text-center text-xs uppercase tracking-[0.18em] text-muted">
        Staff access only. Public site →{" "}
        <a href="/" className="text-blue-accent hover:text-white">
          forgedcustoms.com
        </a>
      </p>
    </div>
  );
}
