"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { communityService } from "@/services/api";
import { Navbar, Footer } from "@/components/layout";
import { Users, Sparkles, Layers, ChevronRight } from "lucide-react";
import { LeaderboardEntry } from "@/types";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface LevelGroup {
  level: number;
  members: LeaderboardEntry[];
}

function getLevelTheme(level: number) {
  if (level >= 20) {
    return {
      headerBg: "from-amber-50 to-orange-50",
      headerBorder: "border-amber-200",
      chipBg: "bg-amber-100",
      chipText: "text-amber-700",
      accent: "from-amber-500 to-orange-500",
    };
  }

  if (level >= 10) {
    return {
      headerBg: "from-sky-50 to-cyan-50",
      headerBorder: "border-sky-200",
      chipBg: "bg-sky-100",
      chipText: "text-sky-700",
      accent: "from-sky-500 to-cyan-500",
    };
  }

  return {
    headerBg: "from-violet-50 to-indigo-50",
    headerBorder: "border-violet-200",
    chipBg: "bg-violet-100",
    chipText: "text-violet-700",
    accent: "from-violet-500 to-indigo-500",
  };
}

function MemberAvatar({ name, avatar }: { name: string; avatar?: string }) {
  const [imageError, setImageError] = useState(false);
  const initial = (name?.trim()?.charAt(0) || "?").toUpperCase();
  const hasAvatar = Boolean(avatar && avatar.trim() !== "" && !imageError);

  if (hasAvatar) {
    return (
      <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
        <Image
          src={avatar as string}
          alt={name}
          fill
          sizes="56px"
          className="object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div className="w-14 h-14 bg-linear-to-br from-primary/80 to-red-600 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-sm">
      {initial}
    </div>
  );
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [apiLevels, setApiLevels] = useState<number[]>([]);
  const [expandedLevels, setExpandedLevels] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const limit = 50;

  const rawTab = (searchParams.get("tab") || "all").toLowerCase();

  const activeLevel = useMemo<number | "all">(() => {
    if (rawTab === "all") {
      return "all";
    }

    if (!rawTab.startsWith("level-")) {
      return "all";
    }

    const parsed = Number(rawTab.replace("level-", ""));
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return "all";
    }

    return parsed;
  }, [rawTab]);

  const handleTabChange = useCallback((next: number | "all") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next === "all" ? "all" : `level-${next}`);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const toggleLevel = (level: number) => {
    setExpandedLevels((prev) =>
      prev.includes(level) ? prev.filter((item) => item !== level) : [...prev, level]
    );
  };

  const levelGroups = useMemo<LevelGroup[]>(() => {
    const membersByLevel = new Map<number, LeaderboardEntry[]>();

    users.forEach((member) => {
      const level = Number(member.level ?? 1);
      if (!Number.isInteger(level) || level <= 0) {
        return;
      }
      if (!membersByLevel.has(level)) {
        membersByLevel.set(level, []);
      }
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

  useEffect(() => {
    const normalizedTab = activeLevel === "all" ? "all" : `level-${activeLevel}`;

    // Keep URL shape consistent for sharing/bookmarking.
    if (rawTab !== normalizedTab) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", normalizedTab);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }
  }, [activeLevel, pathname, rawTab, router, searchParams]);

  const visibleGroups = useMemo(() => {
    if (activeLevel === "all") {
      return levelGroups;
    }
    return levelGroups.filter((group) => group.level === activeLevel);
  }, [activeLevel, levelGroups]);

  useEffect(() => {
    if (activeLevel !== "all" && !loading && levelGroups.length > 0) {
      const hasLevel = levelGroups.some((group) => group.level === activeLevel);
      if (!hasLevel) {
        handleTabChange("all");
      }
    }
  }, [activeLevel, handleTabChange, levelGroups, loading]);

  useEffect(() => {
    if (activeLevel === "all" && levelGroups.length > 0 && expandedLevels.length === 0) {
      setExpandedLevels(levelGroups.slice(0, 2).map((group) => group.level));
    }
  }, [activeLevel, expandedLevels.length, levelGroups]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const [leaderboardResult, levelConfigsResult] = await Promise.allSettled([
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
            .filter((level) => Number.isInteger(level) && level > 0);
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="back" />

      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-red-100/50 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-20 left-0 w-100 h-100 bg-orange-100/50 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <main className="pt-32 pb-20 container mx-auto px-4 z-10 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full text-red-600 font-medium text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            Hall of Fame Komunitas
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-800 mb-6"
          >
            Hall of <span className="text-primary">Fame</span> Ruang Tenang
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed"
          >
            Apresiasi untuk anggota yang aktif berbagi energi positif, dukungan, dan inspirasi di komunitas.
          </motion.p>
        </div>

        {loading ? (
          <div className="max-w-6xl mx-auto space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>

            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
                <div className="h-14 bg-gray-100 animate-pulse" />
                <div className="p-3 space-y-2">
                  {Array.from({ length: 4 }).map((__, row) => (
                    <div key={row} className="h-12 rounded-lg bg-gray-100 animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : levelGroups.length > 0 ? (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="sticky top-20 md:top-24 z-20 rounded-2xl border border-gray-100 bg-white/95 backdrop-blur p-3 md:p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-gray-700">Filter Level</p>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => handleTabChange("all")}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${activeLevel === "all"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  Semua Level
                </button>

                {levelGroups.map((group) => (
                  <button
                    key={`filter-${group.level}`}
                    onClick={() => handleTabChange(group.level)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${activeLevel === group.level
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    Level {group.level} ({group.members.length})
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {visibleGroups.map((group, groupIndex) => {
                const theme = getLevelTheme(group.level);
                const isExpanded = activeLevel === "all" ? expandedLevels.includes(group.level) : true;

                return (
                  <motion.section
                    key={`level-${group.level}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(groupIndex * 0.08, 0.35) }}
                    className="rounded-2xl border border-gray-100 bg-white overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => activeLevel === "all" && toggleLevel(group.level)}
                      className={`w-full text-left border-b ${theme.headerBorder} bg-gradient-to-r ${theme.headerBg} px-4 py-3 ${activeLevel === "all" ? "cursor-pointer" : "cursor-default"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                            Ruang Apresiasi Level
                          </p>
                          <h2 className="text-lg md:text-xl font-bold text-gray-800">
                            Level {group.level}
                          </h2>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${theme.chipBg} ${theme.chipText}`}>
                            {group.members.length} Anggota
                          </span>
                          {activeLevel === "all" && (
                            <ChevronRight
                              className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : "rotate-0"}`}
                            />
                          )}
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="max-h-[360px] overflow-y-auto">
                        {group.members.length > 0 ? (
                          group.members.map((member, memberIndex) => (
                            <div
                              key={`${group.level}-${member.user_id ?? "anonymous"}-${member.name}-${memberIndex}`}
                              className="group relative px-4 py-2.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/70 transition-colors"
                            >
                              <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${theme.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />

                              <div className="flex items-center gap-3">
                                <MemberAvatar name={member.name} avatar={member.avatar} />

                                <div className="min-w-0 flex-1">
                                  <h3 className="font-semibold text-gray-800 truncate text-sm">{member.name}</h3>
                                  <p className="text-xs text-gray-500 truncate mt-0.5">
                                    {member.badge_name || "Anggota Komunitas"}
                                  </p>
                                </div>

                                <div className="text-right shrink-0">
                                  <p className="text-[11px] text-gray-500">Jejak Kebaikan</p>
                                  <p className="text-sm font-bold text-gray-800">
                                    {Number(member.exp ?? 0).toLocaleString()} EXP
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center">
                            <p className="text-sm font-medium text-gray-500">Belum ada anggota di level ini</p>
                            <p className="text-xs text-gray-400 mt-1">Data akan otomatis muncul saat anggota mencapai level ini</p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.section>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 max-w-4xl mx-auto">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500">Belum ada anggota Hall of Fame</h3>
            <p className="text-gray-400 text-sm mt-1">Data akan tampil setelah aktivitas komunitas tersedia</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
