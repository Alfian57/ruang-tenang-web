import Link from "next/link";
import type { MemberDashboardViewModel } from "./useMemberDashboardViewModel";

interface JourneyMapSectionProps {
  viewModel: MemberDashboardViewModel;
}

export function JourneyMapSection({ viewModel }: JourneyMapSectionProps) {
  const journeyMap = viewModel.journeyMap;

  return (
    <section data-user-tour="user-journey-map" className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Creative Signature Feature</p>
      <h2 className="mt-1 text-xl font-semibold text-gray-900">{journeyMap?.title ?? "Peta Perjalanan Tenang"}</h2>
      <p className="mt-1 text-sm leading-6 text-gray-600">
        {journeyMap?.narrative ?? "Gabungan mood, streak, jurnal, breathing, reward, dan progress map akan tampil sebagai perjalanan personal."}
      </p>
      <div className="mt-4 grid gap-2">
        {(journeyMap?.nodes ?? []).slice(0, 5).map((node) => (
          <Link key={node.key} href={node.route} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 hover:bg-amber-50">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{node.label}</p>
                <p className="truncate text-xs text-gray-500">{node.description}</p>
              </div>
              <span className="text-sm font-bold text-amber-700">{Math.round(node.progress)}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.min(100, Math.max(0, node.progress))}%` }} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
