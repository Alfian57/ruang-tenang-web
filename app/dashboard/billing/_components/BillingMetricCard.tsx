import Image from "next/image";

type BillingMetricCardProps = {
  label: string;
  value: string;
  detail: string;
  mascot: string;
};

export function BillingMetricCard({ label, value, detail, mascot }: BillingMetricCardProps) {
  return (
    <article className="relative flex min-h-[104px] min-w-0 items-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-theme-accent-border hover:shadow-md">
      <div className="relative z-10 min-w-0 pr-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
        <p className="mt-1 truncate text-xl font-bold tracking-tight text-slate-900">{value}</p>
        <p className="mt-0.5 truncate text-xs text-slate-500">{detail}</p>
      </div>
      <div className="pointer-events-none absolute -bottom-1 -right-1 grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full bg-rose-50/90">
        <Image src={mascot} alt="" width={72} height={72} sizes="72px" className="h-14 w-14 object-contain" />
      </div>
    </article>
  );
}
