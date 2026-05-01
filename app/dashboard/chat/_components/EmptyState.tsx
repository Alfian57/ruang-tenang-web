"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, CreditCard, History, Lock, NotebookPen, Plus, Sparkles, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { SuggestedPrompt, type BillingStatus } from "@/types";

interface EmptyStateProps {
  onCreateSession: () => void;
  suggestedPrompts?: SuggestedPrompt[];
  onSuggestedPromptClick?: (prompt: string) => void;
  creativeModes?: {
    id: string;
    label: string;
    description: string;
    prompt: string;
  }[];
  onCreativeModeClick?: (prompt: string) => void;
  journeyCompanion?: {
    sessionsThisWeek: number;
    previousSession: {
      uuid: string;
      title: string;
      lastMessage?: string;
      updatedAt: string;
    } | null;
    quickPrompts: {
      id: string;
      label: string;
      text: string;
    }[];
  };
  onJourneyPromptClick?: (prompt: string) => void;
  onResumeJourneySession?: (sessionId: string) => Promise<void>;
  billingStatus?: BillingStatus | null;
  chatQuotaNotice?: string | null;
  onOpenBillingFromQuota?: () => void;
}

/**
 * Empty state view shown when no chat session is selected.
 * Encourages users to start a new conversation.
 */
export function EmptyState({
  onCreateSession,
  suggestedPrompts,
  onSuggestedPromptClick,
  creativeModes,
  onCreativeModeClick,
  journeyCompanion,
  onJourneyPromptClick,
  onResumeJourneySession,
  billingStatus,
  chatQuotaNotice,
  onOpenBillingFromQuota,
}: EmptyStateProps) {
  const [showCreativeModes, setShowCreativeModes] = useState(false);

  const formatUpdatedDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "baru saja";
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const guidedPrompt = journeyCompanion?.quickPrompts[0]?.text ?? suggestedPrompts?.find((prompt) => prompt.category === "mood")?.text ?? suggestedPrompts?.[0]?.text;
  const firstPrompt = suggestedPrompts?.[0]?.text;
  const quota = billingStatus?.chat_quota;
  const isPremium = Boolean(billingStatus?.is_premium || quota?.is_unlimited);
  const isQuotaExhausted = Boolean(chatQuotaNotice || (quota && !isPremium && quota.remaining <= 0));
  const resetLabel = quota?.reset_at
    ? new Date(quota.reset_at).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
    : null;

  const handleStartConversation = () => {
    if (isQuotaExhausted) {
      onOpenBillingFromQuota?.();
      return;
    }

    onCreateSession();
  };

  const handlePromptAction = (prompt?: string, action?: (value: string) => void) => {
    if (isQuotaExhausted) {
      onOpenBillingFromQuota?.();
      return;
    }

    if (prompt) {
      action?.(prompt);
      return;
    }

    onCreateSession();
  };

  return (
    <div className="min-h-full bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-5xl">
        <section className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Teman Cerita AI</p>
          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Mulai dari langkah yang paling ringan</h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                Pilih satu jalur. Kamu bisa lanjut sesi lama, mulai check-in terpandu, atau pakai prompt singkat.
              </p>
            </div>
            <Button
              onClick={handleStartConversation}
              className={`h-11 rounded-lg px-5 text-sm font-semibold text-white ${isQuotaExhausted ? "bg-amber-600 hover:bg-amber-700" : "bg-primary hover:bg-primary/90"}`}
            >
              {isQuotaExhausted ? <Lock className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              {isQuotaExhausted ? "Buka Premium" : "Buat Obrolan Baru"}
            </Button>
          </div>
        </section>

        {isQuotaExhausted && (
          <section className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-950">Kuota chat gratis sedang terkunci</p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-800">
                    {chatQuotaNotice || "Kuota chat gratis periode ini sudah habis."}
                    {resetLabel ? ` Reset berikutnya: ${resetLabel}.` : ""}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={onOpenBillingFromQuota}>
                  <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                  Upgrade
                </Button>
                <Button asChild size="sm" variant="outline" className="border-amber-300 bg-white text-amber-800 hover:bg-amber-100">
                  <Link href={ROUTES.JOURNAL}>
                    <NotebookPen className="mr-1.5 h-3.5 w-3.5" />
                    Jurnal
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="border-amber-300 bg-white text-amber-800 hover:bg-amber-100">
                  <Link href={ROUTES.BREATHING}>
                    <Wind className="mr-1.5 h-3.5 w-3.5" />
                    Napas
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        <section className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <article className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
            <History className="h-5 w-5 text-sky-700" />
            <h4 className="mt-3 text-base font-semibold text-gray-900">Lanjut sesi terakhir</h4>
            {journeyCompanion?.previousSession ? (
              <>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">{journeyCompanion.previousSession.title}</p>
                <p className="mt-1 text-xs text-sky-700">Update: {formatUpdatedDate(journeyCompanion.previousSession.updatedAt)}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4 border-sky-200 bg-white text-sky-700 hover:bg-sky-100"
                  onClick={() => {
                    const session = journeyCompanion.previousSession;
                    if (!session) return;
                    void onResumeJourneySession?.(session.uuid);
                  }}
                >
                  Lanjutkan
                </Button>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-gray-600">Belum ada sesi lama. Mulai obrolan pertama dari check-in singkat.</p>
                <Button size="sm" variant="outline" className="mt-4 border-sky-200 bg-white text-sky-700 hover:bg-sky-100" onClick={handleStartConversation}>
                  {isQuotaExhausted ? "Upgrade dulu" : "Mulai baru"}
                </Button>
              </>
            )}
          </article>

          <article className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <NotebookPen className="h-5 w-5 text-rose-700" />
            <h4 className="mt-3 text-base font-semibold text-gray-900">Mulai guided check-in</h4>
            <p className="mt-1 text-sm text-gray-600">Cocok saat kamu belum tahu harus cerita dari mana.</p>
            <Button
              size="sm"
              className={`mt-4 ${isQuotaExhausted ? "bg-amber-600 hover:bg-amber-700" : "bg-rose-600 hover:bg-rose-700"}`}
              onClick={() => handlePromptAction(guidedPrompt, onJourneyPromptClick ?? onSuggestedPromptClick)}
            >
              {isQuotaExhausted && <Lock className="mr-1.5 h-3.5 w-3.5" />}
              {isQuotaExhausted ? "Terkunci" : "Check-in sekarang"}
            </Button>
          </article>

          <article className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
            <Sparkles className="h-5 w-5 text-violet-700" />
            <h4 className="mt-3 text-base font-semibold text-gray-900">Pilih prompt cepat</h4>
            <p className="mt-1 text-sm text-gray-600">Gunakan prompt siap pakai untuk memulai percakapan terarah.</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-4 border-violet-200 bg-white text-violet-700 hover:bg-violet-100"
              onClick={() => handlePromptAction(firstPrompt, onSuggestedPromptClick)}
            >
              {isQuotaExhausted && <Lock className="mr-1.5 h-3.5 w-3.5" />}
              {isQuotaExhausted ? "Terkunci" : "Pakai prompt"}
            </Button>
          </article>
        </section>

        {journeyCompanion && journeyCompanion.quickPrompts.length > 0 && (
          <section className="mt-5 rounded-2xl border border-sky-200 bg-white p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Journey Companion</p>
                <p className="mt-1 text-sm text-sky-900">
                  {journeyCompanion.sessionsThisWeek} sesi aktif dalam 7 hari terakhir.
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {journeyCompanion.quickPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  onClick={() => handlePromptAction(prompt.text, onJourneyPromptClick)}
                  className={`rounded-xl border px-3 py-2 text-left text-xs font-medium transition-colors ${isQuotaExhausted ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100" : "border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100"}`}
                >
                  {isQuotaExhausted && <Lock className="mr-1 inline h-3 w-3 align-[-2px]" />}
                  {prompt.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {suggestedPrompts && suggestedPrompts.length > 0 && (
          <section className="mt-5 rounded-2xl border border-gray-200 bg-white/85 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Atau mulai dengan prompt ini:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {suggestedPrompts.slice(0, 4).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handlePromptAction(prompt.text, onSuggestedPromptClick)}
                  className={`p-3 text-left text-sm transition-all group rounded-xl border ${isQuotaExhausted ? "border-amber-200 bg-amber-50 hover:bg-amber-100" : "border-gray-200 bg-white hover:bg-primary/5 hover:border-primary/20"}`}
                >
                  <span className={`line-clamp-2 ${isQuotaExhausted ? "text-amber-900" : "text-gray-700 group-hover:text-primary"}`}>
                    {isQuotaExhausted && <Lock className="mr-1 inline h-3 w-3 align-[-2px]" />}
                    {prompt.text}
                  </span>
                  <span className="text-xs text-gray-400 mt-1 block capitalize">
                    {prompt.category === "mood" ? "Berdasarkan Mood" :
                      prompt.category === "time_based" ? "Berdasarkan Waktu" :
                        prompt.category === "follow_up" ? "Lanjutan" : "Umum"}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {creativeModes && creativeModes.length > 0 && (
          <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-4">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setShowCreativeModes((value) => !value)}
            >
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-violet-700">Creative Conversation Mode</span>
                <span className="mt-1 block text-sm text-gray-600">Opsi gaya pendampingan tambahan.</span>
              </span>
              {showCreativeModes ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>

            {showCreativeModes && (
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {creativeModes.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => handlePromptAction(mode.prompt, onCreativeModeClick)}
                    className={`rounded-xl border px-3 py-2 text-left transition-colors ${isQuotaExhausted ? "border-amber-200 bg-amber-50 hover:bg-amber-100" : "border-violet-200 bg-violet-50 hover:bg-violet-100"}`}
                  >
                    <p className={`text-xs font-semibold ${isQuotaExhausted ? "text-amber-900" : "text-violet-800"}`}>
                      {isQuotaExhausted && <Lock className="mr-1 inline h-3 w-3 align-[-2px]" />}
                      {mode.label}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-gray-600">{mode.description}</p>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
