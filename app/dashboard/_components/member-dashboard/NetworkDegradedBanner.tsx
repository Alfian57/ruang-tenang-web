import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MemberDashboardViewModel } from "./useMemberDashboardViewModel";

interface NetworkDegradedBannerProps {
  viewModel: MemberDashboardViewModel;
}

export function NetworkDegradedBanner({ viewModel }: NetworkDegradedBannerProps) {
  if (!viewModel.network.isNetworkDegraded) return null;

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-white p-1.5 border border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-900">Koneksi terdeteksi tidak stabil</p>
          <p className="text-xs text-amber-800 mt-1">
            Beberapa widget mungkin tampil dengan data terakhir agar flow utama tetap usable. Sinkron terakhir: {viewModel.network.lastSyncLabel}.
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={viewModel.network.isLoadingWidgets}
        className="border-amber-300 text-amber-800 hover:bg-amber-100"
        onClick={viewModel.network.refreshDashboardData}
      >
        <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${viewModel.network.isLoadingWidgets ? "animate-spin" : ""}`} />
        Muat Ulang Data
      </Button>
    </section>
  );
}
