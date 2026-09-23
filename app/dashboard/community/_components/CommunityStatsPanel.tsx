"use client";

import { motion } from "framer-motion";
import { BarChart3, ChevronLeft, ChevronRight, Flame, Trophy, Users } from "lucide-react";
import { CommunityStatsCard, HallOfFame } from "@/components/shared/gamification";
import { CommunitySkeleton } from "./CommunitySkeleton";
import { useCommunityData } from "../_hooks/useCommunityData";

export default function CommunityStatsPanel() {
  const {
    communityStats,
    hallOfFame,
    currentLevel,
    maxLevel,
    loading,
    isLevelChanging,
    handleLevelChange,
  } = useCommunityData();

  if (loading) return <CommunitySkeleton />;

  return (
    <div className="space-y-8 pb-8">
      {communityStats ? (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <Users className="h-5 w-5 text-primary" /> Pencapaian Komunitas
          </h2>
          <CommunityStatsCard stats={communityStats} />
        </motion.section>
      ) : (
        <div className="rounded-xl border bg-white p-8 text-center text-sm text-gray-500">
          Statistik komunitas belum tersedia.
        </div>
      )}

      <section className="rounded-xl border bg-white p-4">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
          <Flame className="h-4 w-4" /> Hall of Impact
        </p>
        <h3 className="mt-1 text-base font-semibold text-gray-900">Dampak Harian Komunitas</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border bg-gray-50 px-3 py-2">
            <p className="text-xs text-gray-500">Anggota baru</p>
            <p className="mt-0.5 text-lg font-bold text-gray-900">+{communityStats?.new_members ?? 0}</p>
          </div>
          <div className="rounded-lg border bg-gray-50 px-3 py-2">
            <p className="text-xs text-gray-500">Energi komunitas</p>
            <p className="mt-0.5 text-lg font-bold text-gray-900">
              {Number(communityStats?.total_xp_earned ?? 0).toLocaleString("id-ID")} XP
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Trophy className="h-5 w-5 text-yellow-500" /> Hall of Fame
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Level sebelumnya"
              onClick={() => handleLevelChange(currentLevel - 1)}
              disabled={isLevelChanging || currentLevel <= 1}
              className="rounded p-1 hover:bg-muted disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="min-w-16 text-center text-sm">Level {currentLevel}</span>
            <button
              type="button"
              aria-label="Level berikutnya"
              onClick={() => handleLevelChange(currentLevel + 1)}
              disabled={isLevelChanging || currentLevel >= maxLevel}
              className="rounded p-1 hover:bg-muted disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        {isLevelChanging ? (
          <div className="min-h-48 animate-pulse rounded-xl border bg-white" />
        ) : hallOfFame ? (
          <HallOfFame data={hallOfFame} hideTierName />
        ) : (
          <div className="rounded-xl border bg-white p-8 text-center text-sm text-gray-500">
            <BarChart3 className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            Belum ada data peringkat pada level ini.
          </div>
        )}
      </section>
    </div>
  );
}
