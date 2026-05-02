import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MitraDashboardViewModel } from "./useMitraDashboardViewModel";

interface MitraNoOrganizationStateProps {
  viewModel: MitraDashboardViewModel;
}

export function MitraNoOrganizationState({ viewModel }: MitraNoOrganizationStateProps) {
  if (viewModel.hasOrganizations) return null;

  return (
    <article className="rounded-2xl border border-dashed border-red-200 bg-red-50/70 p-4 text-sm text-red-800 sm:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-red-900">Belum ada organisasi</p>
          <p className="mt-1">Buat organisasi pertama untuk membuka invite anggota, subscription, analytics, dan pembayaran.</p>
        </div>
        <Button type="button" onClick={() => viewModel.setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Buat Organisasi
        </Button>
      </div>
    </article>
  );
}
