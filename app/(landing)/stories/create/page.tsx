"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storyService } from "@/services/api";
import { Navbar, Footer } from "@/components/layout";
import { useAuthStore } from "@/store/authStore";
import { StoryForm } from "@/components/shared/stories";
import { StoryCategory, StoryStats, CreateStoryRequest } from "@/types";
import { ArrowLeft, AlertTriangle, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function CreateStoryPage() {
    const router = useRouter();
    const { token, user } = useAuthStore();

    const [categories, setCategories] = useState<StoryCategory[]>([]);
    const [myStats, setMyStats] = useState<StoryStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Redirect if not authenticated
        if (!token) {
            router.push("/login?redirect=/stories/create");
            return;
        }

        const fetchData = async () => {
            try {
                const [categoriesRes, statsRes] = await Promise.all([
                    storyService.getCategories(),
                    storyService.getMyStats(token),
                ]);

                setCategories(categoriesRes.data || []);
                setMyStats(statsRes.data);
            } catch {
                setError("Gagal memuat data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, router]);

    const handleSubmit = async (data: CreateStoryRequest) => {
        if (!token) return;

        setSubmitting(true);
        setError(null);

        try {
            await storyService.create(token, data);
            router.push("/stories?success=created");
        } catch {
            setError("Gagal mengirim cerita. Silakan coba lagi.");
        } finally {
            setSubmitting(false);
        }
    };

    // Check if user can create story
    const canCreate = user && user.level >= 3;
    const canSubmitMore = myStats?.can_submit_more ?? true;

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar variant="back" />
                <div className="container mx-auto px-4 pt-32 pb-20">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div className="h-8 w-48 rounded bg-gray-200 animate-pulse" />
                        <div className="h-4 w-72 rounded bg-gray-200 animate-pulse" />
                        <div className="rounded-xl border bg-card p-6 space-y-4">
                            <div className="h-5 w-32 rounded bg-gray-200 animate-pulse" />
                            <div className="h-10 w-full rounded bg-gray-200 animate-pulse" />
                            <div className="h-5 w-32 rounded bg-gray-200 animate-pulse" />
                            <div className="h-10 w-full rounded bg-gray-200 animate-pulse" />
                            <div className="h-5 w-32 rounded bg-gray-200 animate-pulse" />
                            <div className="h-40 w-full rounded bg-gray-200 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Level restriction
    if (!canCreate) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar variant="back" />
                <main className="pt-32 pb-20 container mx-auto px-4">
                    <div className="max-w-md mx-auto text-center">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h1 className="text-2xl font-bold mb-4">Level 3 Diperlukan</h1>
                        <p className="text-muted-foreground mb-6">
                            Untuk berbagi cerita, kamu perlu mencapai level 3.
                            Level kamu saat ini: <strong>Level {user?.level || 1}</strong>
                        </p>
                        <p className="text-sm text-muted-foreground mb-6">
                            Terus beraktivitas di platform untuk meningkatkan level dan membuka fitur ini!
                        </p>
                        <Link href="/stories">
                            <Button>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali ke Cerita
                            </Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Monthly limit reached
    if (!canSubmitMore) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar variant="back" />
                <main className="pt-32 pb-20 container mx-auto px-4">
                    <div className="max-w-md mx-auto text-center">
                        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="h-10 w-10 text-orange-500" />
                        </div>
                        <h1 className="text-2xl font-bold mb-4">Batas Bulanan Tercapai</h1>
                        <p className="text-muted-foreground mb-6">
                            Kamu sudah membagikan {myStats?.stories_this_month} cerita bulan ini
                            (maksimal {myStats?.max_stories_per_month} cerita per bulan).
                        </p>
                        <p className="text-sm text-muted-foreground mb-6">
                            Tunggu hingga bulan depan untuk berbagi cerita baru.
                            {user && user.level >= 7 && " Sebagai pengguna Level 7+, kamu mendapatkan kuota tambahan!"}
                        </p>
                        <Link href="/stories">
                            <Button>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali ke Cerita
                            </Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar variant="back" />

            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-125 h-125 bg-pink-100/30 rounded-full blur-[120px] -z-10 pointer-events-none" />

            <main className="pt-32 pb-20 container mx-auto px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Back Link */}
                    <Link
                        href="/stories"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Cerita
                    </Link>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl font-bold mb-2">Bagikan Ceritamu</h1>
                        <p className="text-muted-foreground">
                            Ceritakan perjalananmu. Kamu tidak sendirian, dan ceritamu bisa menginspirasi orang lain.
                        </p>
                    </motion.div>

                    {/* Stats Info */}
                    {myStats && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-muted/50 rounded-lg p-4 mb-6"
                        >
                            <p className="text-sm text-muted-foreground">
                                📊 Cerita bulan ini: {myStats.stories_this_month}/{myStats.max_stories_per_month}
                                {myStats.total_stories > 0 && ` • Total cerita: ${myStats.total_stories}`}
                                {myStats.total_hearts > 0 && ` • Total hati: ${myStats.total_hearts}`}
                            </p>
                        </motion.div>
                    )}

                    {/* Error Alert */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-destructive/10 text-destructive rounded-lg p-4 mb-6"
                        >
                            <p>{error}</p>
                        </motion.div>
                    )}

                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card rounded-xl border p-6"
                    >
                        <StoryForm
                            categories={categories}
                            onSubmit={handleSubmit}
                            isLoading={submitting}
                            submitLabel="Kirim untuk Ditinjau"
                        />
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
