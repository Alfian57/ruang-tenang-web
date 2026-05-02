import type { MitraDashboardViewModel } from "./useMitraDashboardViewModel";
import { MetricCard } from "./MetricCard";
import { PageSection } from "./PageSection";

interface MitraKpiCardsProps {
  viewModel: MitraDashboardViewModel;
}

export function MitraKpiCards({ viewModel }: MitraKpiCardsProps) {
  return (
    <PageSection className="md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Organisasi" value={viewModel.organizations.length} helper="workspace yang dikelola" />
      <MetricCard label="Seat aktif" value={viewModel.seatUsage?.used_seats ?? 0} helper={`dari ${viewModel.seatUsage?.contracted_seats ?? 0} seat`} />
      <MetricCard label="Utilisasi" value={`${viewModel.analytics?.seat_utilization_pct ?? viewModel.seatUsagePercent}%`} helper={`${viewModel.seatUsage?.available_seats ?? 0} seat tersisa`} tone={viewModel.seatUsageTone} />
      <MetricCard label="Chat agregat 30 hari" value={viewModel.totalMessages} helper="tanpa isi percakapan" />
    </PageSection>
  );
}
