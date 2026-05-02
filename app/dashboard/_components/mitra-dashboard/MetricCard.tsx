interface MetricCardProps {
  label: string;
  value: string | number;
  helper?: string;
  tone?: "red" | "amber" | "rose" | "gray";
}

export function MetricCard({ label, value, helper, tone = "red" }: MetricCardProps) {
  const toneClass = {
    red: "border-red-100 bg-white text-red-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    rose: "border-rose-200 bg-rose-50 text-rose-800",
    gray: "border-gray-200 bg-white text-gray-700",
  }[tone];

  return (
    <article className={`min-w-0 rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-md ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-950">{value}</p>
      {helper && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
    </article>
  );
}
