"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Navbar, Footer } from "@/components/landing";
import { useAuthStore } from "@/stores/authStore";
import { StoryForm } from "@/components/stories";
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
                    api.getStoryCategories(),
                    api.getMyStoryStats(token),
                ]);

                setCategories(categoriesRes.data || []);
                setMyStats(statsRes.data);
            } catch (err) {
                console.error("Failed to fetch data:", err);
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
            await api.createStory(token, data);
            router.push("/stories?success=created");
        } catch (err) {
            console.error("Failed to create story:", err);
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
                <div className="flex justify-center items-center py-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
