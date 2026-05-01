"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
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
import { LandingDataNotice } from "./LandingDataNotice";

const GAMIFICATION_FEATURES = [
  {
    icon: Zap,
    title: "XP & Naik Level",
    description:
      "Kumpulkan XP dan Koin Emas dari setiap aktivitas: login, ngobrol, menulis jurnal, dan membaca artikel. Naik level untuk membuka reward.",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  {
    icon: CalendarCheck,
    title: "Misi Harian",
    description:
      "Tujuh misi harian mendorongmu merawat diri, mulai dari login, rekam mood, hingga menulis jurnal. Setiap misi memberi XP dan Koin Emas.",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
  },
  {
    icon: Flame,
    title: "Streak Login",
    description:
      "Jaga streak login harianmu. Semakin panjang streak, semakin besar bonus XP dan Koin Emas yang kamu dapatkan.",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  {
    icon: Shield,
    title: "Pelindung Streak",
    description:
      "Lupa login satu hari? Pelindung streak menjaga ritmemu seminggu sekali agar progres tidak langsung hilang.",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  {
    icon: Award,
    title: "Koleksi Badge",
    description:
      "Raih badge spesial untuk pencapaian unikmu, dari pengguna baru hingga Hall of Fame.",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
  },
  {
    icon: TrendingUp,
    title: "Hall of Fame",
    description:
      "Bersaing secara sehat di Hall of Fame publik. Lihat siapa yang paling aktif merawat kesehatan mentalnya.",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
];

export function GamificationSection() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-white via-red-50/70 to-rose-50/40 px-4 py-14 sm:py-16 md:py-20" id="gamification">
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center md:mb-12"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm">
            <Star className="w-4 h-4" />
            Gamifikasi
          </div>
          <h2 className="mb-4 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl md:text-5xl">
            Merawat Diri Jadi{" "}
            <span className="bg-linear-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
              Lebih Seru
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
            Sistem gamifikasi yang memotivasi kamu untuk konsisten menjaga
            kesehatan mental. Kumpulkan XP, Koin Emas, raih badge, dan naik level.
          </p>
          <div className="mt-5">
            <LandingDataNotice variant="demo" />
          </div>
        </motion.div>

        <div className="grid items-start gap-5 lg:grid-cols-12 lg:gap-8">
          {/* Left: Daily mission preview card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
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
                  className={`rounded-2xl border ${feature.borderColor} bg-white p-5 shadow-sm shadow-red-950/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg group`}
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
                href={ROUTES.GAMIFICATION}
                className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
              >
                <span>Lihat Gamifikasi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
