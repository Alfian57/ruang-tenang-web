import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  formatBillingCycle,
  formatCurrency,
  formatDate,
} from "../mitra-dashboard-utils";
import type { MitraDashboardViewModel } from "./useMitraDashboardViewModel";

interface MitraQuoteFormProps {
  viewModel: MitraDashboardViewModel;
  title?: string;
  submitLabel?: string;
}

export function MitraQuoteForm({ viewModel, title = "Quote dan Rekomendasi", submitLabel = "Buat Quote" }: MitraQuoteFormProps) {
  return (
    <article data-mitra-tour="mitra-quote-form" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
        <Sparkles className="h-5 w-5 text-red-600" />
        {title}
      </h2>
      <form onSubmit={viewModel.handleCreateQuote} className="mt-4 space-y-3">
        <div className="space-y-1.5">
          <Label>Paket</Label>
          <Select value={viewModel.quoteForm.plan_id} onValueChange={viewModel.handleQuotePlanChange}>
            <SelectTrigger><SelectValue placeholder="Pilih paket" /></SelectTrigger>
            <SelectContent>
              {viewModel.activePlans.map((plan) => (
                <SelectItem key={plan.id} value={String(plan.id)}>
                  {plan.name} - {formatCurrency(plan.base_price_per_seat)} / seat
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {viewModel.selectedQuotePlan && (
            <p className="text-xs text-gray-500">
              Batas paket: {viewModel.selectedQuotePlan.min_seats}-{viewModel.selectedQuotePlan.max_seats} seat.
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="quote-seats">Jumlah seat</Label>
            <Input
              id="quote-seats"
              type="number"
              min={viewModel.selectedQuotePlan?.min_seats ?? 1}
              max={viewModel.selectedQuotePlan?.max_seats}
              placeholder={String(viewModel.selectedQuotePlan?.min_seats ?? 25)}
              value={viewModel.quoteForm.requested_seats}
              onChange={(event) => viewModel.setQuoteForm((prev) => ({ ...prev, requested_seats: event.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Siklus billing</Label>
            <Select value={viewModel.quoteForm.billing_cycle} onValueChange={(value) => viewModel.setQuoteForm((prev) => ({ ...prev, billing_cycle: value }))}>
              <SelectTrigger><SelectValue placeholder="Pilih siklus" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Bulanan</SelectItem>
                <SelectItem value="yearly">Tahunan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button type="submit" variant="outline" disabled={viewModel.isSubmitting || viewModel.activePlans.length === 0 || !viewModel.selectedQuotePlan}>{submitLabel}</Button>
      </form>
      {viewModel.lastQuote && (
        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm">
          <p className="font-semibold text-red-900">{viewModel.lastQuote.quote_code}</p>
          <p className="text-red-800">{formatCurrency(viewModel.lastQuote.final_amount)} sampai {formatDate(viewModel.lastQuote.valid_until)}</p>
        </div>
      )}
      {viewModel.pricingRecommendation && (
        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-800">
          Rekomendasi: {viewModel.pricingRecommendation.recommended_seats} seat, siklus {formatBillingCycle(viewModel.pricingRecommendation.recommended_billing_cycle)}, tingkat keyakinan {viewModel.pricingRecommendation.confidence_score}%.
        </div>
      )}
    </article>
  );
}
