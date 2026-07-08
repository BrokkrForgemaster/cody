import Image from "next/image";
import type { ImageAsset } from "@/types/content";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  image?: ImageAsset;
};

export function PageHero({ eyebrow, title, description, image }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-black pt-20">
      {image ? (
        <>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/78 to-black/28" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />
        </>
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(193,18,31,0.16),transparent_34%),linear-gradient(315deg,rgba(30,144,255,0.14),transparent_30%)]" />
      )}
      <div className="container-page relative z-10 flex min-h-[58svh] items-end pb-14 pt-28">
        <div className="max-w-4xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="heading-xl mt-4">{title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-200 sm:text-2xl">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
