import { ArrowRight, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MemberDashboardViewModel } from "./useMemberDashboardViewModel";

interface CrisisSupportSectionProps {
  viewModel: MemberDashboardViewModel;
}

export function CrisisSupportSection({ viewModel }: CrisisSupportSectionProps) {
  return (
    <section data-user-tour="user-crisis-support" className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white p-2 text-rose-700">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-rose-950">Butuh bantuan cepat?</p>
            <p className="mt-1 text-xs leading-5 text-rose-800">
              Jika situasi terasa tidak aman atau sangat berat, buka dukungan cepat dan hubungi bantuan darurat.
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" className="border-rose-200 bg-white text-rose-700 hover:bg-rose-100" onClick={() => viewModel.crisis.setShowCrisisSupport(true)}>
          Buka Safe Support
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
