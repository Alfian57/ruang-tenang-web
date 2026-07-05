"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { communityService } from "@/services/api";
import { CommunityStats } from "@/types";
import {
  Users,
  BookOpen,
  Heart,
  Zap,
} from "lucide-react";

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
  const shouldReduceMotion = useReducedMotion();
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
    <section id="community" className="relative overflow-hidden border-y border-rose-100 bg-linear-to-r from-rose-50/80 via-white to-rose-50/80 px-4 py-8 sm:py-10">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {STAT_CONFIGS.map((config, index) => {
            const rawValue = hasStats && stats ? config.getValue(stats) : 0;
            const value = Number.isFinite(rawValue) ? Math.max(0, Math.floor(rawValue)) : 0;

            return (
              <motion.div
                key={config.key}
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={shouldReduceMotion ? { duration: 0 } : { delay: index * 0.08 }}
                className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-white/80 p-3 shadow-sm backdrop-blur sm:p-4"
              >
                <div
                  className={`h-10 w-10 shrink-0 rounded-xl ${config.bgColor} flex items-center justify-center sm:h-12 sm:w-12`}
                >
                  <config.icon className={`h-5 w-5 ${config.color} sm:h-6 sm:w-6`} />
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-bold text-gray-900 sm:text-2xl">
                    {loading ? (
                      <span className="inline-block h-6 w-14 bg-gray-100 rounded animate-pulse sm:h-7 sm:w-16" />
                    ) : (
                      <AnimatedCounter value={value} suffix={config.suffix} />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-medium sm:text-sm">
                    {config.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {!loading && !hasStats && (
          <div className="mt-4 rounded-xl border border-dashed border-rose-200 bg-white/80 px-4 py-4 text-center">
            <p className="text-sm text-gray-500">
              Statistik komunitas sedang dimuat...
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
