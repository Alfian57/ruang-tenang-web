"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/lib/routes";
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
        <div className="mb-8 rounded-xl border border-red-100 bg-card p-4 sm:p-6">
            <div className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-start gap-3 sm:gap-4">
                    <div className="rounded-full bg-primary/10 p-3">
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
                    <Link href={ROUTES.LOGIN} className="w-full md:w-auto">
                        <Button className="w-full md:w-auto">
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
                    <Link href={ROUTES.PUBLIC_STORY_CREATE} className="w-full md:w-auto">
                        <Button className="w-full md:w-auto">
                            <Plus className="h-4 w-4 mr-2" />
                            Tulis Cerita
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
