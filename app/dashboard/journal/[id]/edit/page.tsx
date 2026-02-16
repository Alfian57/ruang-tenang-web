"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useJournalStore } from "@/store/journalStore";
import { useAuthStore } from "@/store/authStore";
import { JournalEditor } from "../../_components"; // Adjust import path
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EditJournalPage() {
    const params = useParams();
    const router = useRouter();
    const { token, isAuthenticated } = useAuthStore();
    const { 
        loadJournal, 
        activeJournal, 
        isLoading, 
        updateJournal, 
        isSaving, 
        settings,
        setActiveJournal
    } = useJournalStore();
    
    const id = params.id ? parseInt(params.id as string) : null;

    useEffect(() => {
        if (!token && !isAuthenticated) {
            router.push("/login");
            return;
        }

        if (token && id) {
            // Load if not present or wrong ID
            if (activeJournal?.id !== id) {
                loadJournal(token, id);
            }
        }
    }, [token, isAuthenticated, id, loadJournal, activeJournal, router]);

     // Clean up on unmount
     useEffect(() => {
        return () => setActiveJournal(null);
    }, [setActiveJournal]);

    const handleUpdate = async (data: {
        title: string;
        content: string;
        mood_id?: number;
        tags: string[];
        is_private: boolean;
        share_with_ai: boolean;
    }) => {
        if (!token || !id) return;
        await updateJournal(token, id, data);
        toast.success("Jurnal berhasil diperbarui!");
        router.push(`/dashboard/journal/${id}`);
    };

    if (isLoading && !activeJournal) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4"><div className="h-4 w-4 rounded bg-gray-200 animate-pulse" /><div className="h-4 w-20 rounded bg-gray-200 animate-pulse" /></div>
                    <div className="h-7 w-28 rounded bg-gray-200 animate-pulse" />
                </div>
                <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
                    <div className="space-y-2"><div className="h-4 w-12 rounded bg-gray-200 animate-pulse" /><div className="h-10 w-full rounded-lg bg-gray-200 animate-pulse" /></div>
                    <div className="space-y-2"><div className="h-4 w-24 rounded bg-gray-200 animate-pulse" /><div className="flex gap-3">{[1,2,3,4,5].map(i => <div key={i} className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />)}</div></div>
                    <div className="space-y-2"><div className="h-4 w-14 rounded bg-gray-200 animate-pulse" /><div className="h-48 w-full rounded-lg bg-gray-200 animate-pulse" /></div>
                    <div className="space-y-2"><div className="h-4 w-10 rounded bg-gray-200 animate-pulse" /><div className="h-10 w-full rounded-lg bg-gray-200 animate-pulse" /></div>
                    <div className="flex gap-3 justify-end pt-4 border-t"><div className="h-10 w-20 rounded-lg bg-gray-200 animate-pulse" /><div className="h-10 w-28 rounded-lg bg-gray-200 animate-pulse" /></div>
                </div>
            </div>
        );
    }

    if (!activeJournal && !isLoading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h2 className="text-xl font-semibold mb-4">Jurnal tidak ditemukan</h2>
                <Button asChild>
                    <Link href="/dashboard/journal">Kembali ke Daftar</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="mb-6">
                <Button variant="ghost" size="sm" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                    <Link href={`/dashboard/journal/${id}`}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Batal Edit
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Edit Jurnal</h1>
            </div>

            {activeJournal && (
                <JournalEditor
                    initialTitle={activeJournal.title}
                    initialContent={activeJournal.content}
                    initialMoodId={activeJournal.mood_id}
                    initialTags={activeJournal.tags}
                    initialIsPrivate={activeJournal.is_private}
                    initialShareWithAI={activeJournal.share_with_ai}
                    onSave={handleUpdate}
                    onCancel={() => router.push(`/dashboard/journal/${id}`)}
                    isSaving={isSaving}
                    defaultShareWithAI={settings?.default_share_with_ai}
                />
            )}
        </div>
    );
}
