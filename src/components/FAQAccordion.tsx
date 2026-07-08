"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/types/content";
import { cn } from "@/lib/utils";

type FAQAccordionProps = {
  items: FaqItem[];
};

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openId, setOpenId] = useState(items[0]?.id ?? "");

  return (
    <div className="divide-y divide-white/10 rounded-lg border border-white/10 bg-panel">
      {items.map((item) => {
        const isOpen = item.id === openId;

        return (
          <div key={item.id}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
              onClick={() => setOpenId(isOpen ? "" : item.id)}
              aria-expanded={isOpen}
            >
              <span className="text-base font-bold text-white sm:text-lg">{item.question}</span>
              <ChevronDown
                size={20}
                className={cn("shrink-0 text-muted transition", isOpen && "rotate-180 text-white")}
                aria-hidden
              />
            </button>
            {isOpen ? (
              <div className="px-5 pb-5 text-sm leading-7 text-muted sm:text-base">
                {item.answer}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
