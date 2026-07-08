type PowderFinishCardProps = {
  name: string;
  description: string;
  background: string;
};

export function PowderFinishCard({ name, description, background }: PowderFinishCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-white/10 bg-panel shadow-2xl shadow-black/25">
      <div className="h-36" style={{ background }} aria-hidden />
      <div className="p-5">
        <h3 className="font-heading text-3xl uppercase leading-none text-white">{name}</h3>
        <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
      </div>
    </article>
  );
}
