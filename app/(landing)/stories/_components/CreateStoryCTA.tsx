"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { BookOpen, LogIn, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoryStats } from "@/types";

interface CreateStoryCTAProps {
    myStats: StoryStats | null;
}

export function CreateStoryCTA({ myStats }: CreateStoryCTAProps) {
    const { token, user } = useAuthStore();

    const canCreateStory = user && user.level >= 3;
    const canSubmitMore = myStats?.can_submit_more ?? true;

    return (
        <div className="bg-card rounded-xl border p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Bagikan Ceritamu</h3>
                        <p className="text-sm text-muted-foreground">
                            {!token
                                ? "Masuk untuk berbagi cerita inspiratif"
                                : !canCreateStory
                                    ? `Level 3 diperlukan untuk berbagi cerita (kamu level ${user?.level})`
                                    : !canSubmitMore
                                        ? `Kamu sudah mencapai batas ${myStats?.max_stories_per_month} cerita bulan ini`
                                        : `${myStats?.stories_this_month ?? 0}/${myStats?.max_stories_per_month ?? 3} cerita bulan ini`}
                        </p>
                    </div>
                </div>

                {!token ? (
                    <Link href="/login">
                        <Button>
                            <LogIn className="h-4 w-4 mr-2" />
                            Masuk
                        </Button>
                    </Link>
                ) : !canCreateStory ? (
                    <Button disabled>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Level 3 Diperlukan
                    </Button>
                ) : !canSubmitMore ? (
                    <Button disabled>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Batas Tercapai
                    </Button>
                ) : (
                    <Link href="/stories/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Tulis Cerita
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
