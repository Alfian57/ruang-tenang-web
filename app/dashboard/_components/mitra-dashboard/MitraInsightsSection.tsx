import { Activity, AlertCircle, BarChart3, CreditCard, FileText, TrendingDown, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatBillingCycle,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatReadableStatus,
  formatShortDate,
  getImpactMetricToneClass,
  type UtilizationTrendPoint,
} from "../mitra-dashboard-utils";
import { AuditLogList } from "./AuditLogList";
import { MitraKpiCards } from "./MitraKpiCards";
import { PageSection } from "./PageSection";
import type { MitraDashboardViewModel } from "./useMitraDashboardViewModel";

interface MitraInsightsSectionProps {
  viewModel: MitraDashboardViewModel;
}

export function MitraInsightsSection({ viewModel }: MitraInsightsSectionProps) {
  return (
    <>
      <MitraKpiCards viewModel={viewModel} />

      <article data-mitra-tour="mitra-impact-report" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Mitra Impact Report</p>
            <h2 className="mt-1 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <FileText className="h-5 w-5 text-red-600" />
              Ringkasan Siap Presentasi
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-600">
              Utilisasi seat, engagement anggota, status subscription, dan rekomendasi tindakan dalam jendela {viewModel.impactReport?.window_days ?? 30} hari.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="w-fit rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
              {viewModel.impactReport ? `Generated ${formatDateTime(viewModel.impactReport.generated_at)}` : "Menunggu data"}
            </span>
            <Button type="button" variant="outline" disabled className="border-red-100 bg-white text-red-700">
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {viewModel.impactReport ? (
          <>
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {viewModel.impactMetrics.map((metric) => (
                <div key={metric.label} className={`rounded-2xl border p-4 ${getImpactMetricToneClass(metric.tone)}`}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide">{metric.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-950">{metric.value}</p>
                  <p className="mt-1 text-xs font-medium">{metric.helper}</p>
                  <p className="mt-3 text-xs leading-5 text-gray-600">{metric.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-gray-950">Engagement Anggota</h3>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Aktif</p>
                    <p className="mt-1 text-xl font-bold text-gray-950">{viewModel.impactEngagement?.active_members ?? 0}/{viewModel.impactEngagement?.total_members ?? 0}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Rate</p>
                    <p className="mt-1 text-xl font-bold text-gray-950">{viewModel.impactEngagement?.engagement_rate_pct ?? 0}%</p>
                  </div>
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Pesan</p>
                    <p className="mt-1 text-xl font-bold text-gray-950">{viewModel.impactEngagement?.messages_sent ?? 0}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Approval</p>
                    <p className="mt-1 text-xl font-bold text-gray-950">{viewModel.impactEngagement?.pending_approvals ?? 0}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-gray-950">Status Subscription</h3>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Paket</p>
                    <p className="mt-1 font-semibold text-gray-950">{viewModel.impactSubscription?.plan_name || "Belum aktif"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</p>
                      <p className="mt-1 font-semibold text-gray-950">{formatReadableStatus(viewModel.impactSubscription?.status)}</p>
                    </div>
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Sisa Hari</p>
                      <p className="mt-1 font-semibold text-gray-950">{viewModel.impactSubscription?.days_remaining ?? "-"}</p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Nilai Kontrak</p>
                    <p className="mt-1 font-semibold text-gray-950">
                      {formatCurrency(viewModel.impactSubscription?.total_amount ?? 0)} / {formatBillingCycle(viewModel.impactSubscription?.billing_cycle)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-gray-950">Rekomendasi Tindakan</h3>
                </div>
                <div className="mt-4 space-y-2">
                  {viewModel.impactReport.recommendations.map((recommendation, index) => (
                    <div key={`${recommendation}-${index}`} className="rounded-xl bg-white px-3 py-3 text-sm leading-6 text-gray-700">
                      {recommendation}
                    </div>
                  ))}
                  {viewModel.impactReport.recommendations.length === 0 && (
                    <div className="rounded-xl bg-white px-3 py-3 text-sm text-gray-600">
                      Tidak ada rekomendasi khusus untuk periode ini.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {viewModel.impactReport.trend.slice(-4).map((item) => {
                const contractedSeats = Math.max(0, item.contracted_seats ?? 0);
                const usedSeats = Math.max(0, item.used_seats ?? 0);
                const trendUtilization = contractedSeats > 0
                  ? Math.round(Math.min(100, (usedSeats / contractedSeats) * 100))
                  : 0;

                return (
                  <div key={item.metric_date} className="rounded-2xl border border-gray-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-600">{formatShortDate(item.metric_date)}</p>
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">{trendUtilization}% seat</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.max(4, trendUtilization)}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-gray-600">{item.active_members} aktif, {item.messages_sent} pesan</p>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-red-200 bg-red-50/60 p-5 text-sm leading-6 text-red-800">
            Impact report akan muncul setelah organisasi dipilih dan data analitik tersedia.
          </div>
        )}
      </article>

      <PageSection className="xl:grid-cols-5">
        <article data-mitra-tour="mitra-utilization-trend" className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm xl:col-span-3">
          <div className="border-b border-red-50 bg-linear-to-br from-red-50 via-white to-orange-50 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Tren Utilisasi</p>
                <h2 className="mt-1 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <BarChart3 className="h-5 w-5 text-red-600" />
                  Seat Premium 14 Hari Terakhir
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-600">
                  Pantau tekanan kapasitas seat, momentum anggota aktif, dan volume pesan agregat tanpa membuka data pribadi pengguna.
                </p>
              </div>
              <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold ${viewModel.utilizationDelta >= 0 ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                {viewModel.utilizationDelta >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(viewModel.utilizationDelta)}% dari titik sebelumnya
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                ["Saat ini", `${viewModel.latestTrendPoint?.utilizationPct ?? viewModel.seatUsagePercent}%`, `${viewModel.latestTrendPoint?.usedSeats ?? viewModel.seatUsage?.used_seats ?? 0}/${viewModel.latestTrendPoint?.contractedSeats ?? viewModel.seatUsage?.contracted_seats ?? 0} seat`],
                ["Rata-rata", `${viewModel.averageUtilization}%`, "periode tampil"],
                ["Puncak", `${viewModel.peakUtilization}%`, `${viewModel.peakMessages} pesan tertinggi`],
                ["Sisa seat", viewModel.latestTrendPoint?.availableSeats ?? viewModel.seatUsage?.available_seats ?? 0, "kapasitas siap pakai"],
              ].map(([label, value, helper]) => (
                <div key={String(label)} className="rounded-2xl border border-white/80 bg-white/85 p-3 shadow-xs">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
                  <p className="mt-1 text-xl font-bold text-gray-950">{value}</p>
                  <p className="mt-1 text-xs text-gray-500">{helper}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5">
            {viewModel.utilizationTrend.length > 0 ? (
              <>
                <div className="h-72 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={viewModel.utilizationTrend} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="mitraUtilizationFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.28} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#fee2e2" strokeDasharray="4 4" vertical={false} />
                      <XAxis
                        dataKey="dateLabel"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        minTickGap={12}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}%`}
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                      />
                      <Tooltip
                        cursor={{ stroke: "#ef4444", strokeWidth: 1, strokeDasharray: "4 4" }}
                        contentStyle={{
                          borderRadius: 14,
                          border: "1px solid #fecaca",
                          boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
                        }}
                        labelFormatter={(_, payload) => {
                          const point = payload?.[0]?.payload as UtilizationTrendPoint | undefined;
                          return point ? formatDate(point.metricDate) : "";
                        }}
                        formatter={(value, name, payload) => {
                          const point = payload.payload as UtilizationTrendPoint;
                          if (name === "utilizationPct") {
                            return [`${value}% (${point.usedSeats}/${point.contractedSeats} seat)`, "Utilisasi"];
                          }
                          return [value, name];
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="utilizationPct"
                        stroke="#ef4444"
                        strokeWidth={3}
                        fill="url(#mitraUtilizationFill)"
                        activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 2, fill: "#ef4444" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {viewModel.utilizationTrend.slice(-3).map((item) => (
                    <div key={item.metricDate} className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-gray-600">{formatShortDate(item.metricDate)}</p>
                        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-red-700">{item.utilizationPct}%</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                        <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.max(4, item.utilizationPct)}%` }} />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <span>{item.usedSeats} seat aktif</span>
                        <span className="text-right">{item.messagesSent} pesan</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/50 p-6 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">Belum ada trend analitik.</p>
                <p className="mt-1 leading-relaxed">
                  Data akan muncul setelah anggota mulai memakai seat premium. Undang anggota, aktifkan seat,
                  lalu buka halaman ini lagi untuk melihat kurva utilisasi.
                </p>
              </div>
            )}
          </div>
        </article>

        <article data-mitra-tour="mitra-audit-log" className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Activity className="h-5 w-5 text-red-600" />
            Audit Terbaru
          </h2>
          <AuditLogList
            logs={viewModel.auditLogs}
            limit={8}
            variant="detail"
            emptyTitle="Audit belum tersedia"
            emptyDescription="Riwayat audit organisasi akan tampil setelah ada aksi pengelolaan anggota, langganan, atau reminder."
          />
        </article>
      </PageSection>
    </>
  );
}
