"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ForumCard } from "@/components/shared/forum/ForumCard";
import { MessageSquare, ChevronRight } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import type { Forum } from "@/types";

const STARTER_PROMPTS = [
    "Hal kecil apa yang paling membantu kamu tetap tenang minggu ini?",
    "Kalau lagi overthinking malam, ritual 10 menit apa yang paling works?",
    "Satu kalimat penyemangat untuk teman yang lagi capek akademik.",
];

interface LatestDiscussionsProps {
    forums: Forum[];
}

export function LatestDiscussions({ forums }: LatestDiscussionsProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-12"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Diskusi Terbaru
                </h2>
                <div className="flex gap-2">
                    <Link href={`${ROUTES.FORUM}/create`}>
                        <Button variant="outline" size="sm">
                            Mulai Diskusi
                        </Button>
                    </Link>
                    <Link href={ROUTES.FORUM}>
                        <Button variant="ghost" size="sm" className="gap-1">
                            Lihat Semua <ChevronRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {forums.length > 0 ? (
                    forums.map((forum) => <ForumCard key={forum.id} forum={forum} className="h-full" />)
                ) : (
                    <div className="col-span-2 py-8 bg-card rounded-xl border border-dashed px-6">
                        <div className="text-center">
                            <MessageSquare className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                            <p className="text-foreground font-medium">Ruang diskusi sedang menunggu topik pertama.</p>
                            <p className="text-sm text-muted-foreground mt-1">Mulai dari prompt berikut agar percakapan terasa hangat dan aman.</p>
                        </div>

                        <div className="mt-5 grid gap-2">
                            {STARTER_PROMPTS.map((prompt) => (
                                <div key={prompt} className="rounded-lg border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                                    {prompt}
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 text-center">
                            <Link href={`${ROUTES.FORUM}/create`} className="inline-block">
                                <Button variant="link" className="text-primary">
                                    Mulai Diskusi Pertama
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
