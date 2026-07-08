import { Star } from "lucide-react";
import type { Testimonial } from "@/types/content";

type TestimonialCardProps = {
  testimonial: Testimonial;
};

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <figure className="rounded-lg border border-white/10 bg-panel p-6 shadow-2xl shadow-black/25">
      <div className="flex gap-1 text-accent" aria-label={`${testimonial.rating} star rating`}>
        {Array.from({ length: testimonial.rating }).map((_, index) => (
          <Star key={index} size={17} fill="currentColor" aria-hidden />
        ))}
      </div>
      <blockquote className="mt-5 text-lg font-medium leading-7 text-white">
        "{testimonial.review}"
      </blockquote>
      <figcaption className="mt-6 text-sm text-muted">
        <span className="font-bold text-white">{testimonial.customerName}</span>
        <span> - {testimonial.city}</span>
        <span className="mt-1 block">{testimonial.vehicle}</span>
      </figcaption>
    </figure>
  );
}
