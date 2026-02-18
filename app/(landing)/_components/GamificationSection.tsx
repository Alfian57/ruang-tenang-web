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

const GAMIFICATION_FEATURES = [
  {
    icon: Zap,
    title: "XP & Level Up",
    description:
      "Kumpulkan XP dari setiap aktivitas — login, ngobrol, nulis jurnal, baca artikel. Naik level dan unlock reward!",
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  {
    icon: CalendarCheck,
    title: "Daily Tasks",
    description:
      "7 tugas harian yang mendorongmu merawat diri — mulai dari login, rekam mood, hingga menulis jurnal.",
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
      "Raih badge spesial untuk pencapaian unikmu — dari Newbie hingga Hall of Fame. Koleksi semuanya!",
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

// Mock daily task items for visual showcase
const MOCK_TASKS = [
  { name: "Login Harian", icon: "🔑", done: true, xp: 10 },
  { name: "Rekam Mood", icon: "💝", done: true, xp: 15 },
  { name: "Chat AI", icon: "💬", done: false, xp: 20 },
  { name: "Baca Artikel", icon: "📖", done: false, xp: 15 },
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
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                     <h3 className="font-bold text-gray-900 text-lg">
                       Daily Tasks
                     </h3>
                     <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-medium border border-gray-200">
                        Preview
                     </span>
                  </div>
                  <p className="text-sm text-gray-500">Selesaikan tugas untuk dapat XP!</p>
                </div>
                <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full" title="Contoh Streak">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-bold text-orange-600">
                    7 hari 🔥
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-semibold text-primary">2/4 selesai</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "50%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="bg-gradient-to-r from-primary to-red-400 h-2.5 rounded-full"
                  />
                </div>
              </div>

              {/* Task items */}
              <div className="space-y-3">
                {MOCK_TASKS.map((task, idx) => (
                  <motion.div
                    key={task.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      task.done
                        ? "bg-green-50/50 border-green-200"
                        : "bg-gray-50/50 border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{task.icon}</span>
                      <span
                        className={`font-medium text-sm ${
                          task.done
                            ? "text-green-700 line-through"
                            : "text-gray-700"
                        }`}
                      >
                        {task.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                        +{task.xp} XP
                      </span>
                      {task.done && (
                        <span className="text-green-500 text-lg">✓</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* XP Summary */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-semibold text-gray-700">
                    Total hari ini
                  </span>
                </div>
                <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
                  +25 XP
                </span>
              </div>
            </div>
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
