import { MessageCircle, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SuggestedPrompt } from "@/types";

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
}: EmptyStateProps) {
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

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4 animate-pulse">
        <MessageCircle className="w-10 h-10 text-primary" />
      </div>

      <h3 className="font-bold text-xl mb-2 text-gray-800">
        Mulai Percakapan Baru
      </h3>

      <p className="text-gray-500 max-w-sm mb-6 leading-relaxed text-sm">
        Ceritakan apa yang sedang kamu rasakan. AI kami siap mendengarkan.
      </p>

      <Button
        onClick={onCreateSession}
        className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-4 h-auto text-sm shadow-md hover:shadow-lg transition-all mb-8"
      >
        <Plus className="w-4 h-4 mr-2" />
        Buat Obrolan Baru
      </Button>

      {journeyCompanion && (
        <div className="w-full max-w-lg mb-8 rounded-2xl border border-sky-200 bg-sky-50/80 p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Journey Companion</p>
          <p className="text-sm text-sky-900 mt-1">
            Kamu aktif <strong>{journeyCompanion.sessionsThisWeek} sesi</strong> dalam 7 hari terakhir.
          </p>

          {journeyCompanion.previousSession && (
            <div className="mt-3 rounded-xl border border-sky-200 bg-white p-3">
              <p className="text-xs font-medium text-sky-700">Sesi Terakhir</p>
              <p className="text-sm font-semibold text-gray-900 mt-1 line-clamp-1">
                {journeyCompanion.previousSession.title}
              </p>
              {journeyCompanion.previousSession.lastMessage && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {journeyCompanion.previousSession.lastMessage}
                </p>
              )}
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] text-gray-500">
                  Update: {formatUpdatedDate(journeyCompanion.previousSession.updatedAt)}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-sky-200 text-sky-700 hover:bg-sky-100"
                  onClick={() => {
                    const session = journeyCompanion.previousSession;
                    if (!session) return;
                    void onResumeJourneySession?.(session.uuid);
                  }}
                >
                  Lanjutkan
                </Button>
              </div>
            </div>
          )}

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {journeyCompanion.quickPrompts.map((prompt) => (
              <button
                key={prompt.id}
                type="button"
                onClick={() => onJourneyPromptClick?.(prompt.text)}
                className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-left text-xs font-medium text-sky-800 hover:bg-sky-100 transition-colors"
              >
                {prompt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {creativeModes && creativeModes.length > 0 && (
        <div className="w-full max-w-lg mb-8 rounded-2xl border border-violet-200 bg-violet-50/80 p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Creative Conversation Mode</p>
          <p className="text-sm text-violet-900 mt-1">
            Pilih gaya pendampingan sesuai kebutuhanmu saat ini.
          </p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {creativeModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => onCreativeModeClick?.(mode.prompt)}
                className="rounded-xl border border-violet-200 bg-white px-3 py-2 text-left hover:bg-violet-100 transition-colors"
              >
                <p className="text-xs font-semibold text-violet-800">{mode.label}</p>
                <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">{mode.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Prompts */}
      {suggestedPrompts && suggestedPrompts.length > 0 && (
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-center gap-2 mb-4 text-sm text-gray-500">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Atau mulai dengan prompt ini:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestedPrompts.slice(0, 4).map((prompt, i) => (
              <button
                key={i}
                onClick={() => onSuggestedPromptClick?.(prompt.text)}
                className="p-3 text-sm bg-white hover:bg-primary/5 hover:border-primary/20 border border-gray-200 rounded-xl transition-all text-left group"
              >
                <span className="text-gray-700 group-hover:text-primary line-clamp-2">
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
        </div>
      )}
    </div>
  );
}
