"use client";

import { useJournalStore } from "@/store/journalStore";
import { JournalEditor } from "../_components";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";

export default function CreateJournalPage() {
    const router = useRouter();
    const { token, isAuthenticated } = useAuthStore();
    const { createJournal, isSaving, settings, loadWritingPrompt, weeklyPrompt, error, clearError } = useJournalStore();

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
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="mb-6">
                <Button variant="ghost" size="sm" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                    <Link href="/dashboard/journal">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Jurnal
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Tulis Jurnal Baru</h1>
            </div>

            <JournalEditor
                onSave={handleCreate}
                isSaving={isSaving}
                defaultShareWithAI={settings?.default_share_with_ai}
                onGeneratePrompt={handleGeneratePrompt}
                writingPrompt={weeklyPrompt?.prompt}
            />
        </div>
    );
}
