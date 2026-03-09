"use client";

import { useEffect, useState } from "react";
import { progressMapService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import type { MapProgressSummary } from "@/types/progress-map";
import { Map, Flag, Compass, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function MapProgressWidget() {
    const { token } = useAuthStore();
    const [summary, setSummary] = useState<MapProgressSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        progressMapService.getProgressSummary(token)
            .then((res) => { if (res.data) setSummary(res.data); })
            .catch(() => { /* non-critical widget */ })
            .finally(() => setIsLoading(false));
    }, [token]);

    if (isLoading) {
        return (
            <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                    <div className="h-5 w-28 bg-gray-100 rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                    <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                </CardContent>
            </Card>
        );
    }

    if (!summary) {
        return (
            <Card className="border border-gray-100 shadow-sm overflow-hidden">
                <CardContent className="p-4 text-center space-y-2">
                    <div className="p-2.5 bg-emerald-50 rounded-xl inline-flex">
                        <Map className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-800">Peta Perjalanan</h4>
                    <p className="text-xs text-gray-500">Mulai petualangan dan buka area baru!</p>
                    <Link href={ROUTES.PROGRESS_MAP}>
                        <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                            Lihat Peta <ArrowRight className="w-3 h-3" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    const progress = Math.round(summary.overall_progress);

    return (
        <Card className="border border-emerald-100/50 shadow-sm bg-linear-to-br from-emerald-50/40 to-sky-50/30 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between px-4 pt-4 pb-1">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-800">
                    <Map className="w-4 h-4 text-emerald-600" />
                    Peta Perjalanan
                </CardTitle>
                <Link href={ROUTES.PROGRESS_MAP}>
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-emerald-600 h-7 px-2">
                        Buka <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-2 space-y-3">
                {/* Progress bar */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-500">Progres Keseluruhan</span>
                        <span className="text-xs font-bold text-emerald-600">{progress}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-linear-to-r from-emerald-400 via-sky-400 to-violet-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                        />
                    </div>
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/70 border border-emerald-100/60 rounded-lg px-2.5 py-2 text-center">
                        <div className="flex items-center justify-center mb-0.5">
                            <Compass className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                        <p className="text-sm font-bold text-gray-900">{summary.unlocked_regions}/{summary.total_regions}</p>
                        <p className="text-[10px] text-gray-500">Area</p>
                    </div>
                    <div className="bg-white/70 border border-sky-100/60 rounded-lg px-2.5 py-2 text-center">
                        <div className="flex items-center justify-center mb-0.5">
                            <Flag className="h-3.5 w-3.5 text-sky-500" />
                        </div>
                        <p className="text-sm font-bold text-gray-900">{summary.unlocked_landmarks}/{summary.total_landmarks}</p>
                        <p className="text-[10px] text-gray-500">Landmark</p>
                    </div>
                </div>

                {/* Latest unlock */}
                {summary.latest_unlock && (
                    <div className="flex items-center gap-2 bg-white/70 border border-amber-100/60 rounded-lg px-3 py-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[10px] text-gray-400">Terakhir Dibuka</p>
                            <p className="text-xs font-medium text-gray-700 truncate">{summary.latest_unlock}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
