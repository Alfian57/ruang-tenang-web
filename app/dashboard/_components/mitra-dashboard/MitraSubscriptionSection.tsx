import { CreditCard, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatBillingCycle, formatCurrency } from "../mitra-dashboard-utils";
import { MitraQuoteForm } from "./MitraQuoteForm";
import { PageSection } from "./PageSection";
import type { MitraDashboardViewModel } from "./useMitraDashboardViewModel";

interface MitraSubscriptionSectionProps {
  viewModel: MitraDashboardViewModel;
}

export function MitraSubscriptionSection({ viewModel }: MitraSubscriptionSectionProps) {
  return (
    <PageSection className="xl:grid-cols-5">
      <article data-mitra-tour="mitra-subscription-summary" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm xl:col-span-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <CreditCard className="h-5 w-5 text-red-600" />
          Langganan dan Seat
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 p-4 md:col-span-2">
            <p className="text-xs uppercase tracking-wide text-gray-500">Paket aktif</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{viewModel.subscription?.plan_name || "Belum aktif"}</p>
            <p className="mt-1 text-sm text-gray-600">{viewModel.subscription ? `${formatCurrency(viewModel.subscription.total_amount)} / ${formatBillingCycle(viewModel.subscription.billing_cycle)}` : "Kontrak langganan belum aktif."}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Sisa seat</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{viewModel.seatUsage?.available_seats ?? 0}</p>
            <p className="mt-1 text-sm text-gray-600">{viewModel.seatUsage?.used_seats ?? 0} digunakan</p>
          </div>
        </div>

        {!viewModel.subscription && (
          <div className="mt-4 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Langganan belum aktif. Buat quote dari panel kanan atau koordinasikan aktivasi kontrak sebelum mengundang banyak anggota.
          </div>
        )}

        <form onSubmit={viewModel.handleUpgradeSeats} className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-red-100 bg-red-50/40 p-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="upgrade-seats">Contracted seat</Label>
            <Input id="upgrade-seats" type="number" min={viewModel.summary?.seat_usage.used_seats ?? 1} placeholder="120" value={viewModel.upgradeForm.contracted_seats} onChange={(event) => viewModel.setUpgradeForm((prev) => ({ ...prev, contracted_seats: event.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Siklus billing</Label>
            <Select value={viewModel.upgradeForm.billing_cycle} onValueChange={(value) => viewModel.setUpgradeForm((prev) => ({ ...prev, billing_cycle: value }))}>
              <SelectTrigger><SelectValue placeholder="Pilih siklus" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Bulanan</SelectItem>
                <SelectItem value="yearly">Tahunan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={viewModel.isSubmitting || !viewModel.subscription}>
              Perbarui Seat
            </Button>
          </div>
        </form>
      </article>

      <div className="xl:col-span-2"><MitraQuoteForm viewModel={viewModel} /></div>

      <article className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm xl:col-span-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <FileText className="h-5 w-5 text-red-600" />
          Paket Tersedia
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {viewModel.activePlans.map((plan) => (
            <div key={plan.id} className="rounded-2xl border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-900">{plan.name}</p>
              <p className="mt-1 text-xl font-bold text-red-700">{formatCurrency(plan.base_price_per_seat)}</p>
              <p className="mt-1 text-xs text-gray-500">Minimal {plan.min_seats} seat, maksimal {plan.max_seats} seat</p>
              <p className="mt-3 text-sm leading-5 text-gray-600">{plan.description}</p>
            </div>
          ))}
          {viewModel.activePlans.length === 0 && <p className="text-sm text-gray-600">Belum ada paket aktif.</p>}
        </div>
      </article>
    </PageSection>
  );
}
