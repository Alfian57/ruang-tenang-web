"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { communityService } from "@/services/api";
import { CommunityStats } from "@/types";
import {
  Users,
  BookOpen,
  ArrowRight,
  Sparkles,
  Heart,
} from "lucide-react";

const STAT_CONFIGS = [
  {
    key: "total_users" as const,
    label: "Pengguna Aktif",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    suffix: "+",
  },
  {
    key: "supportive_hearts_given" as const,
    label: "Dukungan Diberikan",
    icon: Heart,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    suffix: "+",
  },
  {
    key: "stories_shared" as const,
    label: "Cerita Inspiratif",
    icon: BookOpen,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    suffix: "",
  },
  {
    key: "total_activities" as const,
    label: "Aktivitas Positif",
    icon: Sparkles,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    suffix: "+",
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await communityService.getStats();
        setStats(response.data);
      } catch {
        // silently ignore
      }
    };
    fetchStats();
  }, []);

  if (!stats) return null;

  return (
    <section id="community" className="py-24 px-4 relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-600 font-medium text-sm mb-6">
            <Users className="w-4 h-4" />
            Komunitas
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Bersama Kita{" "}
            <span className="text-primary">Lebih Kuat</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Bergabung dengan komunitas yang saling mendukung dan menginspirasi.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {STAT_CONFIGS.map((config, index) => {
            // Access property dynamically with type safety check if needed,
            // but since we verified keys exist in CommunityStats, straightforward access works
            // if we cast key to keyof CommunityStats
            const value = stats[config.key as keyof CommunityStats] as number || 0;
            return (
              <motion.div
                key={config.key}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center mx-auto mb-4`}
                >
                  <config.icon className={`w-6 h-6 ${config.color}`} />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                  <AnimatedCounter value={value} suffix={config.suffix} />
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  {config.label}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            <span>Jelajahi Komunitas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
