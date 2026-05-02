import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import type { MemberDashboardViewModel } from "./useMemberDashboardViewModel";

interface WellnessPlanSectionProps {
  viewModel: MemberDashboardViewModel;
}

export function WellnessPlanSection({ viewModel }: WellnessPlanSectionProps) {
  const {
    wellnessPlan,
    upcomingWellnessItem,
    completeWellnessPlanItem,
    refreshDashboardData,
  } = viewModel.wellness;

  return (
    <section data-user-tour="user-wellness-plan" className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
        <div className="min-w-0">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Personalized Wellness Plan</p>
              <h2 className="mt-1 text-xl font-semibold text-gray-900">{wellnessPlan?.title ?? "Rencana Tenang 7 Hari"}</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                {wellnessPlan?.summary ?? "Selesaikan onboarding singkat untuk membuat rencana 7 hari berdasarkan mood, tujuan, dan kebiasaanmu."}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Progress</p>
              <p className="text-2xl font-bold text-gray-900">{wellnessPlan?.completion_percent ?? 0}%</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {(wellnessPlan?.items ?? []).slice(0, 4).map((item) => {
              const isDone = item.status === "completed";
              return (
                <div key={item.id} className={`rounded-2xl border p-3 ${isDone ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-gray-50"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Hari {item.day_number}</span>
                    {isDone ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <span className="h-2 w-2 rounded-full bg-amber-400" />}
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600">{item.description}</p>
                </div>
              );
            })}
            {(!wellnessPlan || wellnessPlan.items.length === 0) && (
              <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-900 sm:col-span-2 xl:col-span-4">
                Onboarding wellness belum selesai. Setelah selesai, rencana 7 hari akan muncul otomatis di sini.
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Langkah plan berikutnya</p>
          <h3 className="mt-2 text-base font-semibold text-gray-900">{upcomingWellnessItem?.title ?? "Lengkapi onboarding"}</h3>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            {upcomingWellnessItem?.description ?? "Jawab beberapa pertanyaan singkat agar dashboard bisa menyusun flow yang lebih terarah."}
          </p>
          <div className="mt-4 flex flex-col gap-2 xs:flex-row">
            {upcomingWellnessItem ? (
              <>
                <Button asChild className="gap-2">
                  <Link href={upcomingWellnessItem.route || ROUTES.DASHBOARD}>
                    Buka Langkah
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button type="button" variant="outline" disabled={upcomingWellnessItem.status === "completed"} onClick={() => completeWellnessPlanItem(upcomingWellnessItem)}>
                  Tandai Selesai
                </Button>
              </>
            ) : (
              <Button type="button" variant="outline" onClick={refreshDashboardData}>
                Muat Ulang
              </Button>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
