import { Activity, Clock } from "lucide-react";
import type { B2BAuditLog } from "@/types";
import { getAuditLogPresentation } from "../mitra-dashboard-utils";

interface AuditLogListProps {
  logs: B2BAuditLog[];
  limit?: number;
  variant?: "compact" | "detail";
  emptyTitle?: string;
  emptyDescription?: string;
}

export function AuditLogList({
  logs,
  limit,
  variant = "compact",
  emptyTitle = "Belum ada catatan audit",
  emptyDescription = "Aktivitas operasional organisasi akan muncul di sini setelah ada perubahan data.",
}: AuditLogListProps) {
  const visibleLogs = typeof limit === "number" ? logs.slice(0, limit) : logs;

  if (visibleLogs.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-red-200 bg-red-50/50 p-5 text-sm">
        <div className="flex flex-col gap-3 xs:flex-row xs:items-start">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
            <Activity className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-950">{emptyTitle}</p>
            <p className="mt-1 leading-6 text-gray-600">{emptyDescription}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {visibleLogs.map((log) => {
        const presentation = getAuditLogPresentation(log);
        const Icon = presentation.Icon;

        if (variant === "detail") {
          return (
            <div key={log.id} className={`min-w-0 rounded-2xl border p-4 ${presentation.toneClass}`}>
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${presentation.iconClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold text-gray-950">{presentation.title}</p>
                      <p className="mt-1 break-words text-sm leading-6 text-gray-700">{presentation.description}</p>
                    </div>
                    <span className="inline-flex w-fit shrink-0 items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200/70">
                      <Clock className="h-3.5 w-3.5" />
                      {presentation.timeLabel}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2 rounded-xl bg-white/75 p-3 text-xs text-gray-600 ring-1 ring-gray-200/70 sm:grid-cols-2">
                    <div className="min-w-0">
                      <p className="font-semibold uppercase tracking-wide text-gray-400">Objek</p>
                      <p className="mt-1 break-words font-medium text-gray-800">{presentation.entityLabel}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold uppercase tracking-wide text-gray-400">Waktu</p>
                      <p className="mt-1 break-words font-medium text-gray-800">{presentation.fullTimeLabel}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div key={log.id} className={`min-w-0 rounded-xl border p-3 transition-shadow hover:shadow-sm ${presentation.toneClass}`}>
            <div className="flex min-w-0 gap-3">
              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${presentation.iconClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold text-gray-950">{presentation.title}</p>
                    <p className="mt-1 break-words text-sm leading-5 text-gray-600">{presentation.description}</p>
                  </div>
                  <span className="inline-flex w-fit shrink-0 items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200/70">
                    <Clock className="h-3.5 w-3.5" />
                    {presentation.timeLabel}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span className="max-w-full break-words rounded-full bg-white/85 px-2.5 py-1 font-medium text-gray-700 ring-1 ring-gray-200/70">
                    {presentation.entityLabel}
                  </span>
                  <span className="break-words">{presentation.fullTimeLabel}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
