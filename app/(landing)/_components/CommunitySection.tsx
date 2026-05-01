"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { communityService } from "@/services/api";
import { CommunityStats } from "@/types";
import {
  Users,
  BookOpen,
  Heart,
  Zap,
} from "lucide-react";
import { LandingDataNotice } from "./LandingDataNotice";

type StatConfig = {
  key: string;
  label: string;
  icon: typeof Users;
  color: string;
  bgColor: string;
  suffix: string;
  getValue: (stats: CommunityStats) => number;
};

const STAT_CONFIGS: StatConfig[] = [
  {
    key: "active_members",
    label: "Pengguna Aktif",
    icon: Users,
    color: "text-red-600",
    bgColor: "bg-red-50",
    suffix: "+",
    getValue: (stats) => Number(stats.active_members ?? 0),
  },
  {
    key: "total_achievements",
    label: "Pencapaian",
    icon: Heart,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    suffix: "+",
    getValue: (stats) => Number(stats.total_achievements ?? 0),
  },
  {
    key: "total_stories_published",
    label: "Cerita Inspiratif",
    icon: BookOpen,
    color: "text-red-700",
    bgColor: "bg-rose-50",
    suffix: "",
    getValue: (stats) => Number(stats.total_stories_published ?? 0),
  },
  {
    key: "total_xp_earned",
    label: "XP Komunitas",
    icon: Zap,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    suffix: " XP",
    getValue: (stats) => Number(stats.total_xp_earned ?? 0),
  },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    const duration = 1500;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function CommunitySection() {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await communityService.getStats();
        setStats(response.data);
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const hasStats = Boolean(stats);

  return (
    <section id="community" className="relative overflow-hidden bg-linear-to-b from-rose-50/40 via-white to-white px-4 py-14 sm:py-16 md:py-20">
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center md:mb-12"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm">
            <Users className="w-4 h-4" />
            Komunitas
          </div>
          <h2 className="mb-4 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl md:text-5xl">
            Bersama Kita{" "}
            <span className="text-primary">Lebih Kuat</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
            Bergabung dengan komunitas yang saling mendukung dan menginspirasi. Angka di bawah adalah agregat publik, bukan data akun pengunjung.
          </p>
          <div className="mt-5">
            <LandingDataNotice variant="public" />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {STAT_CONFIGS.map((config, index) => {
            const rawValue = hasStats && stats ? config.getValue(stats) : 0;
            const value = Number.isFinite(rawValue) ? Math.max(0, Math.floor(rawValue)) : 0;

            return (
              <motion.div
                key={config.key}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl border border-rose-100 bg-white p-5 text-center shadow-sm shadow-red-950/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg md:p-6"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center mx-auto mb-4`}
                >
                  <config.icon className={`w-6 h-6 ${config.color}`} />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                  {loading ? (
                    <span className="inline-block h-10 w-20 bg-gray-100 rounded animate-pulse" />
                  ) : (
                    <AnimatedCounter value={value} suffix={config.suffix} />
                  )}
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  {config.label}
                </p>
              </motion.div>
            );
          })}
        </div>

        {!loading && !hasStats && (
          <div className="rounded-2xl border border-dashed border-rose-200 bg-white/80 px-6 py-8 text-center">
            <p className="text-lg font-semibold text-gray-700 mb-2">Statistik komunitas belum tersedia</p>
            <p className="text-sm text-gray-500">
              Data komunitas sedang disiapkan. Section ini tetap tampil dan akan terisi otomatis saat data tersedia.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
