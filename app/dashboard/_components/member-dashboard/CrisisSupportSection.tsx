import { ArrowRight, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MemberDashboardViewModel } from "./useMemberDashboardViewModel";

interface CrisisSupportSectionProps {
  viewModel: MemberDashboardViewModel;
}

export function CrisisSupportSection({ viewModel }: CrisisSupportSectionProps) {
  return (
    <section data-user-tour="user-crisis-support" className="member-dashboard-support p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="member-dashboard-support-icon rounded-xl p-2">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div>
            <strong className="text-sm">Butuh bantuan cepat?</strong>
            <p className="mt-1 text-xs leading-5">
              Jika situasi terasa tidak aman atau sangat berat, buka dukungan cepat dan hubungi bantuan darurat.
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" className="shrink-0 rounded-full" onClick={() => viewModel.crisis.setShowCrisisSupport(true)}>
          Buka Safe Support
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
