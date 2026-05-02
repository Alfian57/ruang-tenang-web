import Link from "next/link";
import { Lock } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import type { MemberDashboardViewModel } from "./useMemberDashboardViewModel";

interface NeedNowSectionProps {
  viewModel: MemberDashboardViewModel;
}

export function NeedNowSection({ viewModel }: NeedNowSectionProps) {
  const {
    selectedNeed,
    needOptions,
    needNow,
    isNeedNowLoading,
    handleNeedClick,
  } = viewModel.needNow;

  return (
    <section data-user-tour="user-need-now" className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Hari Ini Aku Butuh Apa?</p>
          <h2 className="mt-1 text-xl font-semibold text-gray-900">Pilih kondisi, langsung dapat arah</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Satu pintu masuk untuk memilih kombinasi napas, musik, jurnal, atau chat AI sesuai kondisi saat ini.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {needOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedNeed === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  disabled={isNeedNowLoading}
                  onClick={() => handleNeedClick(option.key)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm font-semibold transition-colors ${isSelected ? "border-sky-300 bg-sky-100 text-sky-900" : "border-gray-200 bg-gray-50 text-gray-700 hover:border-sky-200 hover:bg-sky-50"}`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
            {needNow ? needNow.title : "Rekomendasi cepat"}
          </p>
          <p className="mt-1 text-sm leading-6 text-sky-900">
            {needNow ? needNow.description : "Pilih salah satu kondisi untuk melihat rangkaian aksi kecil yang paling cocok."}
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {(needNow?.recommendations ?? []).map((item) => (
              <Link
                key={`${item.type}-${item.title}`}
                href={item.locked ? ROUTES.BILLING : item.route}
                className={`rounded-2xl border bg-white p-3 transition-shadow hover:shadow-sm ${item.locked ? "border-violet-200" : "border-sky-100"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">{item.type}</span>
                  {item.locked && <Lock className="h-3.5 w-3.5 text-violet-600" />}
                </div>
                <h3 className="mt-2 text-sm font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-1 text-xs leading-5 text-gray-600">{item.description}</p>
              </Link>
            ))}
            {!needNow && (
              <div className="rounded-2xl border border-dashed border-sky-200 bg-white/70 p-4 text-sm text-sky-900 md:col-span-3">
                Rekomendasi akan tampil di sini dan tersimpan sebagai sinyal kebutuhan hari ini.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
