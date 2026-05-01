"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { communityService } from "@/services/api";
import { Navbar, Footer } from "@/components/layout";
import { Users, Sparkles, Layers, Award, Star } from "lucide-react";
import { LeaderboardEntry } from "@/types";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface LevelGroup {
  level: number;
  members: LeaderboardEntry[];
}

/* ─── Avatar ────────────────────────────────────────────────────── */

function MemberAvatar({
  name,
  avatar,
  size = "md",
}: {
  name: string;
  avatar?: string;
  size?: "sm" | "md" | "lg";
}) {
  const [imageError, setImageError] = useState(false);
  const initial = (name?.trim()?.charAt(0) || "?").toUpperCase();
  const hasAvatar = Boolean(avatar && avatar.trim() !== "" && !imageError);

  const dims: Record<string, { box: string; text: string; px: number }> = {
    sm: { box: "w-11 h-11", text: "text-base", px: 44 },
    md: { box: "w-14 h-14", text: "text-xl", px: 56 },
    lg: { box: "w-20 h-20 md:w-24 md:h-24", text: "text-3xl", px: 96 },
  };
  const d = dims[size];

  if (hasAvatar) {
    return (
      <div
        className={`relative ${d.box} rounded-2xl overflow-hidden bg-gray-100 shadow-sm ring-2 ring-white`}
      >
        <Image
          src={avatar as string}
          alt={name}
          fill
          sizes={`${d.px}px`}
          className="object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${d.box} bg-gradient-to-br from-primary/80 to-red-600 rounded-2xl flex items-center justify-center ${d.text} font-bold text-white shadow-sm ring-2 ring-white`}
    >
      {initial}
    </div>
  );
}

/* ─── Featured Card (Non-ranked) ─────────────────────────────── */

function FeaturedCard({
  member,
  index,
}: {
  member: LeaderboardEntry;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.12, type: "spring", stiffness: 120 }}
      className="flex flex-col items-center rounded-3xl border border-red-100 bg-white/90 p-5 shadow-xl shadow-red-100/30 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-100/40 sm:p-6"
    >
      {/* Decorative star */}
      <div className="mb-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
          <Star className="w-4 h-4 text-white fill-white" />
        </div>
      </div>

      {/* Avatar */}
      <div className="mb-4">
        <MemberAvatar name={member.name} avatar={member.avatar} size="lg" />
      </div>

      {/* Name & Badge */}
      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1 truncate max-w-full text-center px-3 w-full">
        {member.name}
      </h3>
      <p className="text-sm text-gray-500 font-medium mb-3 text-center">
        {member.badge_name || "Anggota Komunitas"}
      </p>

      {/* EXP */}
      <div className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full font-bold text-sm">
        {Number(member.exp ?? 0).toLocaleString()} EXP
      </div>
    </motion.div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */

export default function HallOfFamePage() {
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [apiLevels, setApiLevels] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const limit = 50;

  const rawTab = (searchParams.get("tab") || "all").toLowerCase();

  const activeLevel = useMemo<number | "all">(() => {
    if (rawTab === "all") return "all";
    if (!rawTab.startsWith("level-")) return "all";
    const parsed = Number(rawTab.replace("level-", ""));
    if (!Number.isInteger(parsed) || parsed <= 0) return "all";
    return parsed;
  }, [rawTab]);

  const handleTabChange = useCallback(
    (next: number | "all") => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", next === "all" ? "all" : `level-${next}`);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  /* ── Level grouping ── */

  const levelGroups = useMemo<LevelGroup[]>(() => {
    const membersByLevel = new Map<number, LeaderboardEntry[]>();

    users.forEach((member) => {
      const level = Number(member.level ?? 1);
      if (!Number.isInteger(level) || level <= 0) return;
      if (!membersByLevel.has(level)) membersByLevel.set(level, []);
      membersByLevel.get(level)?.push(member);
    });

    const uniqueApiLevels = Array.from(new Set(apiLevels))
      .filter((level) => Number.isInteger(level) && level > 0)
      .sort((a, b) => b - a);

    const extraLevelsFromUsers = Array.from(membersByLevel.keys())
      .filter((level) => !uniqueApiLevels.includes(level))
      .sort((a, b) => b - a);

    const allLevels = [...uniqueApiLevels, ...extraLevelsFromUsers];

    return allLevels.map((level) => ({
      level,
      members: membersByLevel.get(level) ?? [],
    }));
  }, [apiLevels, users]);

  /* ── Effects ── */

  useEffect(() => {
    const normalizedTab =
      activeLevel === "all" ? "all" : `level-${activeLevel}`;
    if (rawTab !== normalizedTab) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", normalizedTab);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    }
  }, [activeLevel, pathname, rawTab, router, searchParams]);

  const visibleGroups = useMemo(() => {
    if (activeLevel === "all") return levelGroups;
    return levelGroups.filter((group) => group.level === activeLevel);
  }, [activeLevel, levelGroups]);

  useEffect(() => {
    if (activeLevel !== "all" && !loading && levelGroups.length > 0) {
      const hasLevel = levelGroups.some(
        (group) => group.level === activeLevel,
      );
      if (!hasLevel) handleTabChange("all");
    }
  }, [activeLevel, handleTabChange, levelGroups, loading]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const [leaderboardResult, levelConfigsResult] =
          await Promise.allSettled([
            communityService.getLeaderboard(limit),
            communityService.getLevelConfigs(),
          ]);

        if (leaderboardResult.status === "fulfilled") {
          setUsers(leaderboardResult.value.data || []);
        } else {
          setUsers([]);
        }

        if (levelConfigsResult.status === "fulfilled") {
          const levels = (levelConfigsResult.value.data || [])
            .map((config) => Number(config.level))
            .filter(
              (level) => Number.isInteger(level) && level > 0,
            );
          setApiLevels(levels);
        } else {
          setApiLevels([]);
        }
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [limit]);

  /* ── Featured members (first 3 overall) ── */
  const featuredMembers = users.slice(0, 3);

  /* ── All remaining members for the list ── */
  const allMembersFlat = useMemo(() => {
    const featured = new Set(featuredMembers.map((m) => m.user_id));
    return visibleGroups.flatMap((group) =>
      group.members
        .filter((m) => activeLevel !== "all" || !featured.has(m.user_id))
        .map((m) => ({ ...m, _groupLevel: group.level })),
    );
  }, [visibleGroups, featuredMembers, activeLevel]);

  /* ── Grouped by level for section headers ── */
  const groupedForList = useMemo(() => {
    const map = new Map<number, (LeaderboardEntry & { _groupLevel: number })[]>();
    allMembersFlat.forEach((m) => {
      const arr = map.get(m._groupLevel) || [];
      arr.push(m);
      map.set(m._groupLevel, arr);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => b - a)
      .map(([level, members]) => ({ level, members }));
  }, [allMembersFlat]);

  return (
    <div className="min-h-screen bg-linear-to-b from-red-50/50 via-white to-white">
      <Navbar variant="back" />

      <main className="container relative z-10 mx-auto px-4 pt-28 pb-16 sm:pt-32 sm:pb-20">
        {/* ── Hero Header ── */}
        <div className="mb-10 text-center sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Hall of Fame Komunitas
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mb-5 text-3xl font-bold leading-tight text-gray-800 md:text-5xl"
          >
            Hall of <span className="text-primary">Fame</span> Ruang Tenang
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg"
          >
            Apresiasi untuk anggota yang aktif berbagi energi positif, dukungan,
            dan inspirasi di komunitas.
          </motion.p>
        </div>

        {loading ? (
          /* ── Loading Skeleton ── */
          <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
            {/* Featured skeleton */}
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-3xl border border-red-100 bg-white p-5 sm:p-6"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 mb-3" />
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 mb-4" />
                    <div className="h-5 bg-gray-100 rounded w-2/3 mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
                    <div className="h-7 bg-gray-100 rounded-full w-20" />
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs skeleton */}
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-9 w-24 rounded-full bg-gray-100 animate-pulse"
                />
              ))}
            </div>

            {/* List skeleton */}
            <div className="overflow-hidden rounded-3xl border border-red-100 bg-white">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="px-5 py-4 border-b border-gray-50 last:border-b-0 flex items-center gap-4 animate-pulse"
                >
                  <div className="w-11 h-11 rounded-2xl bg-gray-100" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 bg-gray-100 rounded w-32" />
                    <div className="h-3 bg-gray-100 rounded w-24" />
                  </div>
                  <div className="h-5 bg-gray-100 rounded w-16" />
                </div>
              ))}
            </div>
          </div>
        ) : levelGroups.length > 0 ? (
          <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
            {/* ── Featured Members ── */}
            {activeLevel === "all" && featuredMembers.length > 0 && (
              <section className="mb-4">
                <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
                  {featuredMembers.map((member, index) => (
                    <FeaturedCard
                      key={`featured-${member.user_id ?? index}`}
                      member={member}
                      index={index}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── Level Filter Tabs ── */}
            <div className="sticky top-20 z-20 rounded-2xl border border-red-100 bg-white/95 p-3 shadow-sm backdrop-blur-md md:top-24 md:p-4">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-gray-700">
                  Filter Level
                </p>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => handleTabChange("all")}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                    activeLevel === "all"
                      ? "bg-primary text-white shadow-md shadow-red-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Semua Level
                </button>

                {levelGroups.map((group) => (
                  <button
                    key={`filter-${group.level}`}
                    onClick={() => handleTabChange(group.level)}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                      activeLevel === group.level
                        ? "bg-primary text-white shadow-md shadow-red-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Level {group.level}{" "}
                    <span className="opacity-70">
                      ({group.members.length})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Member List ── */}
            {groupedForList.length > 0 ? (
              <div className="space-y-6">
                {groupedForList.map((group, groupIdx) => (
                  <motion.section
                    key={`list-level-${group.level}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: Math.min(groupIdx * 0.08, 0.35),
                    }}
                  >
                    {/* Section header */}
                    <div className="flex items-center gap-3 mb-3 px-1">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-sm">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-800">
                          Level {group.level}
                        </h2>
                        <p className="text-xs text-gray-500">
                          {group.members.length} anggota
                        </p>
                      </div>
                    </div>

                    {/* Member rows */}
                    <div className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
                      {group.members.length > 0 ? (
                        group.members.map((member, memberIdx) => (
                          <div
                            key={`${group.level}-${member.user_id ?? "anon"}-${member.name}-${memberIdx}`}
                            className="group relative border-b border-red-50 px-3 py-3 transition-colors duration-200 last:border-b-0 hover:bg-red-50/30 sm:px-5"
                          >
                            {/* Left accent on hover */}
                            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-red-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-full" />

                            <div className="flex items-center gap-3">
                              <MemberAvatar
                                name={member.name}
                                avatar={member.avatar}
                                size="sm"
                              />

                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-gray-800 truncate text-sm">
                                  {member.name}
                                </h3>
                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                  {member.badge_name || "Anggota Komunitas"}
                                </p>
                              </div>

                              <div className="shrink-0 text-right">
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
                                  {Number(member.exp ?? 0).toLocaleString()} EXP
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-5 py-10 text-center">
                          <p className="text-sm font-medium text-gray-500">
                            Belum ada anggota di level ini
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Data akan otomatis muncul saat anggota mencapai
                            level ini
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.section>
                ))}
              </div>
            ) : (
              <div className="mx-auto max-w-4xl rounded-3xl border border-red-100 bg-white py-12 text-center">
                <Users className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500">
                  Tidak ada anggota di level ini
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Coba pilih level lain atau tampilkan semua level
                </p>
              </div>
            )}
          </div>
        ) : (
          /* ── Global Empty ── */
          <div className="mx-auto max-w-4xl rounded-3xl border border-red-100 bg-white py-16 text-center shadow-sm">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">
              Belum ada anggota Hall of Fame
            </h3>
            <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
              Data akan tampil setelah aktivitas komunitas tersedia. Mulai
              berkontribusi untuk tampil di sini!
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
