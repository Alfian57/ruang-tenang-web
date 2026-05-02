import { Clock, ReceiptText } from "lucide-react";
import {
  formatCurrency,
  formatDate,
} from "../mitra-dashboard-utils";
import { MitraQuoteForm } from "./MitraQuoteForm";
import { PageSection } from "./PageSection";
import type { MitraDashboardViewModel } from "./useMitraDashboardViewModel";

interface MitraPaymentsSectionProps {
  viewModel: MitraDashboardViewModel;
}

export function MitraPaymentsSection({ viewModel }: MitraPaymentsSectionProps) {
  const payableAmount = viewModel.lastQuote?.final_amount ?? viewModel.subscription?.total_amount ?? 0;
  const billingPeriod = viewModel.subscription ? `${formatDate(viewModel.subscription.starts_at)} - ${formatDate(viewModel.subscription.ends_at)}` : "Belum ada periode aktif";
  const dueLabel = viewModel.lastQuote ? formatDate(viewModel.lastQuote.valid_until) : formatDate(viewModel.subscription?.ends_at);

  return (
    <PageSection className="xl:grid-cols-5">
      <article data-mitra-tour="mitra-payment-summary" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm xl:col-span-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <ReceiptText className="h-5 w-5 text-red-600" />
          Ringkasan Tagihan
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-red-100 bg-red-50/60 p-4 md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Nominal berjalan</p>
            <p className="mt-1 text-2xl font-bold text-gray-950 xs:text-3xl">{formatCurrency(payableAmount)}</p>
            <p className="mt-1 text-sm text-red-800">{viewModel.lastQuote ? `Quote ${viewModel.lastQuote.quote_code}` : viewModel.subscriptionStateLabel}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Jatuh tempo</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{dueLabel}</p>
            <p className="mt-1 text-sm text-gray-600">{viewModel.daysUntilRenewal === null ? "Belum aktif" : `${viewModel.daysUntilRenewal} hari tersisa`}</p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200">
          <div className="grid grid-cols-1 gap-1 border-b border-gray-100 px-4 py-3 text-sm xs:grid-cols-2">
            <span className="text-gray-500">Organisasi</span>
            <span className="font-medium text-gray-900 xs:text-right">{viewModel.selectedOrganizationName}</span>
          </div>
          <div className="grid grid-cols-1 gap-1 border-b border-gray-100 px-4 py-3 text-sm xs:grid-cols-2">
            <span className="text-gray-500">Periode</span>
            <span className="font-medium text-gray-900 xs:text-right">{billingPeriod}</span>
          </div>
          <div className="grid grid-cols-1 gap-1 border-b border-gray-100 px-4 py-3 text-sm xs:grid-cols-2">
            <span className="text-gray-500">Seat</span>
            <span className="font-medium text-gray-900 xs:text-right">{viewModel.seatUsage?.used_seats ?? 0}/{viewModel.seatUsage?.contracted_seats ?? 0}</span>
          </div>
          <div className="grid grid-cols-1 gap-1 px-4 py-3 text-sm xs:grid-cols-2">
            <span className="text-gray-500">Status</span>
            <span className="font-medium text-gray-900 xs:text-right">{viewModel.subscription?.status ?? "quote diperlukan"}</span>
          </div>
        </div>
      </article>

      <div className="xl:col-span-2"><MitraQuoteForm viewModel={viewModel} title="Quote Pembayaran" submitLabel="Buat Quote Pembayaran" /></div>

      <article data-mitra-tour="mitra-payment-flow" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm xl:col-span-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Clock className="h-5 w-5 text-red-600" />
          Flow Pembayaran
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            ["1", "Buat quote", "Pilih paket, seat, dan siklus billing sesuai kebutuhan organisasi."],
            ["2", "Konfirmasi tagihan", "Gunakan quote terbaru sebagai acuan nominal dan periode pembayaran."],
            ["3", "Aktivasi seat", "Setelah pembayaran dikonfirmasi, seat premium siap dialokasikan ke anggota."],
          ].map(([step, title, description]) => (
            <div key={step} className="rounded-2xl border border-gray-200 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-700">{step}</div>
              <p className="mt-3 font-semibold text-gray-900">{title}</p>
              <p className="mt-1 text-sm leading-5 text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </article>
    </PageSection>
  );
}
