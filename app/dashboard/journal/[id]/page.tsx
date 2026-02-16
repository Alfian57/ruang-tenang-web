"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useJournalStore } from "@/store/journalStore";
import { useAuthStore } from "@/store/authStore";
import { JournalDetail } from "../_components";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

export default function JournalDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { token, isAuthenticated } = useAuthStore();
    const { 
        loadJournal, 
        activeJournal, 
        isLoading, 
        deleteJournal, 
        toggleAIShare,
        setActiveJournal 
    } = useJournalStore();
    
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const id = params.id ? parseInt(params.id as string) : null;

    useEffect(() => {
        if (!token && !isAuthenticated) {
            router.push("/login");
            return;
        }

        if (token && id) {
            // Check if we already have the correct journal in store
            if (activeJournal?.id !== id) {
                loadJournal(token, id);
            }
        }
    }, [token, isAuthenticated, id, loadJournal, activeJournal, router]);

    // Clean up on unmount
    useEffect(() => {
        return () => setActiveJournal(null);
    }, [setActiveJournal]);

    const handleDelete = async () => {
        if (!token || !id) return;
        await deleteJournal(token, id);
        toast.success("Jurnal berhasil dihapus");
        router.push("/dashboard/journal");
    };

    const handleToggleAIShare = async () => {
        if (!token || !id) return;
        await toggleAIShare(token, id);
        toast.success("Status berbagi AI berhasil diubah");
    };

    if (isLoading && !activeJournal) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-9 w-9 rounded-lg bg-gray-200 animate-pulse" />
                    <div className="h-5 w-32 rounded bg-gray-200 animate-pulse" />
                </div>
                <div className="bg-white rounded-2xl border shadow-sm p-6 lg:p-8 space-y-6">
                    <div className="space-y-3">
                        <div className="h-8 w-2/3 rounded bg-gray-200 animate-pulse" />
                        <div className="flex items-center gap-3"><div className="h-4 w-28 rounded bg-gray-200 animate-pulse" /><div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" /></div>
                    </div>
                    <div className="flex gap-2"><div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" /><div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" /></div>
                    <div className="space-y-3 pt-4 border-t">
                        {[1,2,3,4,5,6].map(i => <div key={i} className="h-4 rounded bg-gray-200 animate-pulse" style={{width: `${80 + (i % 3) * 7}%`}} />)}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
                        <div className="h-6 w-10 rounded-full bg-gray-200 animate-pulse" />
                    </div>
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
            {activeJournal && (
                <>
                    <JournalDetail
                        journal={activeJournal}
                        onBack={() => router.push("/dashboard/journal")}
                        onEdit={() => router.push(`/dashboard/journal/${id}/edit`)}
                        onDelete={() => setShowDeleteModal(true)}
                        onToggleAIShare={handleToggleAIShare}
                    />

                    <DeleteConfirmationModal
                        isOpen={showDeleteModal}
                        onClose={() => setShowDeleteModal(false)}
                        onConfirm={handleDelete}
                        title="Hapus Jurnal"
                        description={`Apakah kamu yakin ingin menghapus jurnal "${activeJournal.title}"? Tindakan ini tidak dapat dibatalkan.`}
                        isLoading={isLoading}
                    />
                </>
            )}
        </div>
    );
}
