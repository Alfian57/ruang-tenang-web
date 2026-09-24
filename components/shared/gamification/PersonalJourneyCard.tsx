"use client";

import Image from "next/image";
import { useState } from "react";
import {
    Activity,
    ArrowRight,
    Flame,
    Gift,
    Map,
    Award,
    Target,
    TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PersonalJourney } from "@/types";
import { cn } from "@/utils";
import { useAuthStore } from "@/store/authStore";
import { GamificationIcon } from "./GamificationIcon";

interface PersonalJourneyCardProps {
    journey: PersonalJourney;
    className?: string;
    onShowLevelGuide?: () => void;
    onShowRewards?: () => void;
}

export function PersonalJourneyCard({
    journey,
    className,
    onShowLevelGuide,
    onShowRewards,
}: PersonalJourneyCardProps) {
    const user = useAuthStore((state) => state.user);
    const [imageError, setImageError] = useState(false);
    const currentExp = Number(journey.current_exp ?? 0);
    const progressPercent = Math.min(100, Math.max(0, Number(journey.progress_percent ?? 0)));
    const expToNextLevel = Number(journey.exp_to_next_level ?? 0);
    const monthlyXp = Number(journey.monthly_xp ?? 0);
    const badgeImage = journey.badge_icon && /^(https?:\/\/|\/|data:image\/)/.test(journey.badge_icon);

    const stats = [
        { icon: Flame, label: "Streak sekarang", value: `${journey.current_streak} hari`, tone: "bg-orange-50 text-orange-600" },
        { icon: Target, label: "Streak terbaik", value: `${journey.longest_streak} hari`, tone: "bg-sky-50 text-sky-600" },
        { icon: TrendingUp, label: "XP bulan ini", value: `+${monthlyXp.toLocaleString("id-ID")}`, tone: "bg-emerald-50 text-emerald-600" },
        { icon: Activity, label: "Total aktivitas", value: Number(journey.total_activities ?? 0).toLocaleString("id-ID"), tone: "bg-violet-50 text-violet-600" },
    ];

    return (
        <section
            className={cn(
                "relative isolate overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-5 shadow-[0_24px_70px_-42px_rgba(239,68,68,0.5)] backdrop-blur sm:p-7",
                className
            )}
        >
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-primary/12 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-amber-200/25 blur-3xl" />
            <div className="pointer-events-none absolute right-8 top-8 hidden text-primary/10 lg:block" aria-hidden="true">
                <Map className="h-36 w-36 rotate-12" strokeWidth={1} />
            </div>

            <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(21rem,0.85fr)] lg:items-center">
                <div>
                    <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                            <div
                                className="grid h-20 w-20 place-items-center overflow-hidden rounded-[1.6rem] border-4 border-white text-2xl font-black text-white shadow-xl"
                                style={{ background: `linear-gradient(135deg, ${journey.tier_color || "#ef4444"}, var(--theme-fab-to))` }}
                            >
                                {user?.avatar ? (
                                    <Image src={user.avatar} alt={`Avatar ${user.name}`} width={80} height={80} className="h-full w-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0).toUpperCase() || journey.current_level
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 grid h-9 min-w-9 place-items-center rounded-xl border-2 border-white bg-slate-950 px-1.5 text-xs font-black text-white shadow-lg">
                                Lv.{journey.current_level}
                            </div>
                        </div>

                        <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-2">
                                {!imageError && badgeImage ? (
                                    <span className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-lg border bg-white shadow-sm">
                                        <Image
                                            src={journey.badge_icon}
                                            alt=""
                                            width={28}
                                            height={28}
                                            className="h-full w-full object-contain"
                                            onError={() => setImageError(true)}
                                        />
                                    </span>
                                ) : (
                                    <GamificationIcon name={journey.badge_name} fallback={Award} className="h-5 w-5 shrink-0 text-amber-500" />
                                )}
                                <h2 className="truncate text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                                    {journey.badge_name || "Penjelajah Baru"}
                                </h2>
                            </div>
                            <p className="mt-0.5 text-sm font-semibold" style={{ color: journey.tier_color || "var(--color-primary)" }}>
                                Tier {journey.tier_name || "Awal"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-7 rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm">
                        <div className="mb-2.5 flex flex-wrap items-end justify-between gap-2">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Menuju level berikutnya</p>
                                <p className="mt-0.5 text-sm font-bold text-slate-900">
                                    {expToNextLevel > 0 ? `${expToNextLevel.toLocaleString("id-ID")} XP lagi` : "Level maksimum tercapai"}
                                </p>
                            </div>
                            <p className="text-right text-sm font-black text-slate-900">
                                {currentExp.toLocaleString("id-ID")} XP <span className="text-xs font-semibold text-slate-400">· {Math.round(progressPercent)}%</span>
                            </p>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100 p-0.5">
                            <div
                                className="h-full rounded-full bg-[linear-gradient(90deg,var(--theme-fab-from),var(--color-primary),var(--theme-fab-to))] shadow-sm transition-[width] duration-700"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                            <span>Peringkat #{journey.rank_in_level || "–"} di level ini</span>
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                                <Award className="h-3.5 w-3.5" /> {journey.new_badges_count ?? 0} badge baru
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                        {onShowLevelGuide ? (
                            <Button onClick={onShowLevelGuide} className="h-11 flex-1 gap-2 rounded-xl shadow-sm">
                                <Map className="h-4 w-4" />
                                Lanjutkan perjalanan
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        ) : null}
                        {onShowRewards ? (
                            <Button onClick={onShowRewards} variant="outline" className="h-11 flex-1 gap-2 rounded-xl border-amber-200 bg-amber-50/70 text-amber-800 hover:bg-amber-100">
                                <Gift className="h-4 w-4" />
                                Lihat hadiah
                            </Button>
                        ) : null}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {stats.map(({ icon: Icon, label, value, tone }) => (
                        <div key={label} className="group rounded-2xl border border-slate-200/70 bg-white/82 p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                            <div className={cn("mb-4 grid h-10 w-10 place-items-center rounded-xl", tone)}>
                                <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                            </div>
                            <p className="text-lg font-black tracking-tight text-slate-950 sm:text-xl">{value}</p>
                            <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
