"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ForumCard } from "@/components/shared/forum/ForumCard";
import { MessageSquare, ChevronRight } from "lucide-react";
import type { Forum } from "@/types";

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
                    <Link href="/dashboard/forum/create">
                        <Button variant="outline" size="sm">
                            Mulai Diskusi
                        </Button>
                    </Link>
                    <Link href="/dashboard/forum">
                        <Button variant="ghost" size="sm" className="gap-1">
                            Lihat Semua <ChevronRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {forums.length > 0 ? (
                    forums.map((forum) => (
                        <ForumCard key={forum.id} forum={forum} className="h-full" />
                    ))
                ) : (
                    <div className="col-span-2 text-center py-8 bg-card rounded-xl border border-dashed">
                        <MessageSquare className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-muted-foreground">Belum ada diskusi terbaru.</p>
                        <Link href="/dashboard/forum/create" className="mt-2 inline-block">
                            <Button variant="link" className="text-primary">
                                Jadilah yang pertama!
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
