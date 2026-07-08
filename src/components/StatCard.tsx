type StatCardProps = {
  value: string;
  label: string;
};

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-panel p-6 shadow-2xl shadow-black/25">
      <p className="font-heading text-5xl uppercase leading-none text-white">{value}</p>
      <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
    </div>
  );
}
