"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, History, Lock, MessageCircle, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import type { BillingStatus, SuggestedPrompt } from "@/types";

interface EmptyStateProps {
  suggestedPrompts?: SuggestedPrompt[];
  onSuggestedPromptClick?: (prompt: string) => void;
  journeyCompanion?: {
    previousSession: { uuid: string; title: string } | null;
    quickPrompts: { id: string; label: string; text: string }[];
  };
  onJourneyPromptClick?: (prompt: string) => void;
  onResumeJourneySession?: (sessionId: string) => Promise<void>;
  billingStatus?: BillingStatus | null;
  chatQuotaNotice?: string | null;
  onOpenBillingFromQuota?: () => void;
}

export function EmptyState({
  suggestedPrompts,
  onSuggestedPromptClick,
  journeyCompanion,
  onJourneyPromptClick,
  onResumeJourneySession,
  billingStatus,
  chatQuotaNotice,
  onOpenBillingFromQuota,
}: EmptyStateProps) {
  const quota = billingStatus?.chat_quota;
  const isQuotaExhausted = Boolean(
    chatQuotaNotice || (quota && !billingStatus?.is_premium && !quota.is_unlimited && quota.remaining <= 0),
  );
  const guidedPrompt = journeyCompanion?.quickPrompts[0];
  const previousSession = journeyCompanion?.previousSession;

  const handlePromptClick = (prompt: string, callback?: (value: string) => void) => {
    if (isQuotaExhausted) {
      onOpenBillingFromQuota?.();
      return;
    }
    callback?.(prompt);
  };

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_28%,#fff1ec_0%,#fffaf7_43%,#ffffff_78%)] px-5 py-8 text-center sm:px-8 sm:py-12">
      <div className="pointer-events-none absolute left-[7%] top-[18%] h-32 w-32 rounded-full bg-rose-100/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[12%] right-[6%] h-40 w-40 rounded-full bg-amber-100/45 blur-3xl" />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center">
        <div className="relative mb-5 flex h-36 w-36 items-center justify-center rounded-full border border-rose-100 bg-white/75 shadow-[0_18px_50px_-25px_rgba(178,56,64,0.3)] sm:h-44 sm:w-44">
          <span className="absolute inset-3 rounded-full bg-gradient-to-b from-rose-50 to-orange-50" />
          <Image
            src="/images/dashboard/mascot/chat-welcome.webp"
            alt="RuNa menyambutmu untuk bercerita"
            width={176}
            height={176}
            priority
            className="relative h-[115%] w-[115%] max-w-none object-contain"
          />
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-rose-600 uppercase shadow-sm">
          <MessageCircle className="h-3 w-3" /> RuNa siap mendengarkan
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Cerita saja, mulai dari mana pun.
        </h1>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
          Tak perlu merangkai kata yang sempurna. Tulis, bicara lewat mikrofon, atau pilih satu titik awal di bawah.
        </p>

        {isQuotaExhausted ? (
          <div className="mt-6 flex w-full max-w-lg flex-col items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-900 sm:flex-row sm:text-left">
            <Lock className="h-5 w-5 shrink-0" />
            <p className="flex-1">{chatQuotaNotice || "Kuota chat gratis habis untuk saat ini."}</p>
            <Button size="sm" onClick={onOpenBillingFromQuota} className="shrink-0 bg-amber-600 hover:bg-amber-700">Buka Premium</Button>
          </div>
        ) : (
          <div className="mt-7 w-full max-w-2xl">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Mulai dengan satu langkah kecil</p>
            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {guidedPrompt && (
                <button
                  type="button"
                  onClick={() => handlePromptClick(guidedPrompt.text, onJourneyPromptClick)}
                  className="group flex min-h-24 w-full flex-col items-start justify-center rounded-2xl border border-rose-200/90 bg-white/95 p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50/80 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                  <span className="w-full whitespace-normal break-words text-sm leading-relaxed text-slate-700">{guidedPrompt.text}</span>
                </button>
              )}
              {suggestedPrompts?.slice(0, 3).map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  onClick={() => handlePromptClick(prompt.text, onSuggestedPromptClick)}
                  className="group flex min-h-24 w-full flex-col items-start justify-center rounded-2xl border border-slate-200/90 bg-white/95 p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50/70 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                  <span className="w-full whitespace-normal break-words text-sm leading-relaxed text-slate-700">{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {previousSession && (
          <button
            type="button"
            onClick={() => void onResumeJourneySession?.(previousSession.uuid)}
            className="mt-7 inline-flex max-w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-white hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <History className="h-4 w-4 shrink-0" />
            <span className="max-w-[15rem] truncate">Lanjutkan: {previousSession.title}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
          </button>
        )}
        {isQuotaExhausted && (
          <Link href={ROUTES.JOURNAL} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-amber-900 underline underline-offset-4">
            <NotebookPen className="h-4 w-4" /> Tulis jurnal sementara
          </Link>
        )}
      </div>
    </div>
  );
}
