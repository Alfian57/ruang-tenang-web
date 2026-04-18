"use client";

import { useJournalStore } from "@/store/journalStore";
import { JournalEditor } from "../_components";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";
import type { JournalMode } from "../_hooks/useJournalEditor";

const JOURNAL_MODE_SET = new Set<JournalMode>([
    "brain-dump",
    "structured-reflection",
    "gratitude",
    "action-plan",
]);

const JOURNAL_CONTEXT_PRESETS: Record<string, {
    label: string;
    suggestedMode: JournalMode;
    initialTitle: string;
    initialTags: string[];
    prompt: string;
}> = {
    "calm-overthinking": {
        label: "Pemulihan Overthinking",
        suggestedMode: "brain-dump",
        initialTitle: "Lepas Overthinking Malam Ini",
        initialTags: ["overthinking", "malam", "pemulihan"],
        prompt: "Tuangkan semua hal yang berputar di kepala kamu. Setelah itu pilih satu beban yang bisa kamu lepaskan malam ini.",
    },
    "focus-reset": {
        label: "Reset Fokus",
        suggestedMode: "action-plan",
        initialTitle: "Reset Fokus Belajar",
        initialTags: ["fokus", "belajar", "langkah-kecil"],
        prompt: "Pecah distraksi jadi 1 target 24 jam, lalu tentukan langkah 10 menit yang bisa kamu mulai sekarang.",
    },
    "gentle-mood-lift": {
        label: "Mood Lift",
        suggestedMode: "gratitude",
        initialTitle: "Naikkan Energi Pelan",
        initialTags: ["mood-lift", "energi", "syukur"],
        prompt: "Tulis 3 hal kecil yang membuatmu sedikit lebih hangat hari ini, lalu tutup dengan satu aksi ringan berikutnya.",
    },
    "mindful-runner": {
        label: "Post-Game Reflection",
        suggestedMode: "structured-reflection",
        initialTitle: "Refleksi Setelah Mindful Runner",
        initialTags: ["mindful-runner", "refleksi", "relaksasi"],
        prompt: "Apa emosi yang paling terasa setelah bermain? Tulis satu hal yang ingin kamu lanjutkan agar mood tetap stabil.",
    },
    "story-weekly-challenge": {
        label: "Story Challenge",
        suggestedMode: "structured-reflection",
        initialTitle: "Draft Kisah Challenge Mingguan",
        initialTags: ["challenge", "kisah", "komunitas"],
        prompt: "Rangkai kisah dari momen sulit ke momen pulih. Fokus ke pembelajaran yang bisa membantu orang lain.",
    },
};

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

export default function CreateJournalPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { token, isAuthenticated } = useAuthStore();
    const { createJournal, isSaving, settings, loadWritingPrompt, weeklyPrompt, error, clearError } = useJournalStore();

    const modeParam = searchParams.get("mode") as JournalMode | null;
    const contextParam = searchParams.get("context");
    const contextPreset = contextParam ? JOURNAL_CONTEXT_PRESETS[contextParam] : undefined;

    const sourceParam = searchParams.get("source") || "";
    const journeyParam = searchParams.get("journey") || "";
    const journeyTitleParam = searchParams.get("journeyTitle") || "";
    const journeyDirectionParam = searchParams.get("journeyDirection") || "";
    const trackTitleParam = searchParams.get("trackTitle") || "";
    const trackCategoryParam = searchParams.get("trackCategory") || "";
    const nextActionParam = searchParams.get("nextAction") || "";

    const isMusicJourneyReflection = sourceParam === "music" && Boolean(journeyParam || journeyTitleParam || trackTitleParam);

    const journeyTitle = journeyTitleParam || contextPreset?.label || "Journey Musik";
    const trackSummary = trackTitleParam
        ? `${trackTitleParam}${trackCategoryParam ? ` (${trackCategoryParam})` : ""}`
        : "Belum ada track spesifik";
    const selectedAction = nextActionParam || "Refleksi terstruktur";
    const journeyDirection = journeyDirectionParam || "Menurunkan intensitas emosi lalu menata fokus";

    const musicSummaryInitialContent = isMusicJourneyReflection
        ? [
            "<h2>Ringkasan Music Journey</h2>",
            "<ul>",
            `<li><strong>Journey:</strong> ${escapeHtml(journeyTitle)}</li>`,
            `<li><strong>Apa yang didengar:</strong> ${escapeHtml(trackSummary)}</li>`,
            `<li><strong>Arah emosi:</strong> ${escapeHtml(journeyDirection)}</li>`,
            `<li><strong>Aksi yang dipilih:</strong> ${escapeHtml(selectedAction)}</li>`,
            "</ul>",
            "<h2>Dampak Mood Saat Ini</h2>",
            "<p>Tulis perubahan emosi yang paling terasa setelah sesi musik ini.</p>",
            "<h2>Langkah Lanjutan 10 Menit</h2>",
            "<p>Tentukan satu aksi kecil yang akan kamu lakukan sekarang agar efek positifnya bertahan.</p>",
        ].join("")
        : undefined;

    const mergedInitialTags = Array.from(
        new Set([
            ...(contextPreset?.initialTags ?? []),
            ...(isMusicJourneyReflection ? ["music-journey"] : []),
            ...(journeyParam ? [`journey-${journeyParam}`] : []),
        ])
    );

    const resolvedInitialTitle = contextPreset?.initialTitle
        || (isMusicJourneyReflection ? `Refleksi Journey: ${journeyTitle}` : undefined);

    const resolvedWritingPrompt = isMusicJourneyReflection
        ? "Gunakan format otomatis ini: apa yang didengar -> aksi yang dipilih -> dampak mood -> langkah lanjutan 10 menit."
        : contextPreset?.prompt || weeklyPrompt?.prompt;

    const initialMode: JournalMode = modeParam && JOURNAL_MODE_SET.has(modeParam)
        ? modeParam
        : contextPreset?.suggestedMode ?? "structured-reflection";

    // Auth check
    useEffect(() => {
        if (!token && !isAuthenticated) {
            router.push("/login");
        }
    }, [token, isAuthenticated, router]);

    // Handle create
    const handleCreate = async (data: {
        title: string;
        content: string;
        mood_id?: number;
        tags: string[];
        is_private: boolean;
        share_with_ai: boolean;
    }) => {
        if (!token) return;
        const newJournal = await createJournal(token, data);
        if (newJournal) {
            toast.success("Jurnal berhasil disimpan!");
            router.push("/dashboard/journal");
        }
    };

    const handleGeneratePrompt = async () => {
        if (!token) return;
        await loadWritingPrompt(token);
        toast.success("Ide menulis berhasil dibuat!");
    };

    if (error) {
        toast.error(error);
        clearError();
    }

    return (
        <div className="p-4 lg:p-6">
            <div className="mb-6">
                <Button variant="ghost" size="sm" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                    <Link href="/dashboard/journal">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Jurnal
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Tulis Jurnal Baru</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Pilih mode menulis yang paling sesuai dengan kondisi kamu hari ini.
                </p>

                {contextPreset && (
                    <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">Context Preset</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{contextPreset.label}</p>
                        <p className="text-xs text-indigo-900 mt-1">
                            Template ini aktif agar refleksi kamu nyambung dengan alur fitur sebelumnya.
                        </p>
                    </div>
                )}

                {isMusicJourneyReflection && (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Auto Reflection Summary</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">Draft refleksi dari Music Journey sudah terisi otomatis</p>
                        <p className="text-xs text-emerald-900 mt-1">
                            Kamu tinggal lengkapi dampak mood dan langkah lanjutan agar loop musik menjadi progres yang terukur.
                        </p>
                    </div>
                )}
            </div>

            <JournalEditor
                onSave={handleCreate}
                isSaving={isSaving}
                defaultShareWithAI={settings?.default_share_with_ai}
                initialMode={initialMode}
                initialTitle={resolvedInitialTitle}
                initialContent={musicSummaryInitialContent}
                initialTags={mergedInitialTags}
                onGeneratePrompt={handleGeneratePrompt}
                writingPrompt={resolvedWritingPrompt}
            />
        </div>
    );
}
