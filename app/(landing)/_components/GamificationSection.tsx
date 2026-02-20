"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap,
  CalendarCheck,
  Flame,
  Shield,
  Award,
  ArrowRight,
  Star,
  TrendingUp,
} from "lucide-react";
import { MockDailyTasksCard } from "./MockDailyTasksCard";

const GAMIFICATION_FEATURES = [
  {
    icon: Zap,
    title: "XP & Level Up",
    description:
      "Kumpulkan XP dari setiap aktivitas - login, ngobrol, nulis jurnal, baca artikel. Naik level dan unlock reward!",
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  {
    icon: CalendarCheck,
    title: "Daily Tasks",
    description:
      "7 tugas harian yang mendorongmu merawat diri - mulai dari login, rekam mood, hingga menulis jurnal.",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    icon: Flame,
    title: "Login Streak",
    description:
      "Jaga streak login harianmu! Semakin panjang streak, semakin besar bonus XP yang kamu dapatkan.",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  {
    icon: Shield,
    title: "Streak Freeze",
    description:
      "Lupa login 1 hari? Tenang! Streak freeze melindungi streak-mu seminggu sekali. Kamu tetap aman.",
    color: "text-cyan-500",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
  },
  {
    icon: Award,
    title: "Badge Collection",
    description:
      "Raih badge spesial untuk pencapaian unikmu - dari Newbie hingga Hall of Fame. Koleksi semuanya!",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    icon: TrendingUp,
    title: "Leaderboard",
    description:
      "Bersaing secara sehat di leaderboard global. Lihat siapa yang paling aktif merawat kesehatan mentalnya.",
    color: "text-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
];

export function GamificationSection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white" id="gamification">
      {/* Background decorations */}
      <div className="absolute top-20 right-0 w-80 h-80 bg-yellow-100/40 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-purple-100/30 rounded-full blur-[100px]" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-full text-yellow-700 font-medium text-sm mb-6">
            <Star className="w-4 h-4" />
            Gamifikasi
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Merawat Diri Jadi{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
              Lebih Seru
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Sistem gamifikasi yang memotivasi kamu untuk konsisten menjaga
            kesehatan mental. Kumpulkan XP, raih badge, dan naik level!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left: Mock Daily Tasks Card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <MockDailyTasksCard />
          </motion.div>

          {/* Right: Feature cards grid */}
          <div className="lg:col-span-7">
            <div className="grid sm:grid-cols-2 gap-4">
              {GAMIFICATION_FEATURES.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className={`p-5 rounded-2xl border ${feature.borderColor} bg-white hover:shadow-lg transition-all duration-300 group`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${feature.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-center sm:text-left"
            >
              <Link
                href="/community"
                className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
              >
                <span>Lihat Komunitas & Gamifikasi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
