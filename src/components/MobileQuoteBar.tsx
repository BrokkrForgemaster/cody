import Link from "next/link";
import { Wrench } from "lucide-react";

export function MobileQuoteBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/92 p-3 backdrop-blur-xl md:hidden">
      <Link href="/quote" className="cta-primary w-full">
        <Wrench size={18} aria-hidden />
        Get Quote
      </Link>
    </div>
  );
}
