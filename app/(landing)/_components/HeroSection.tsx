"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { ArrowRight, Map, Trophy, Palette } from "lucide-react";

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  const introTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.6, delay: 0.2 };
  const theaterTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.6, delay: 0.35 };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-32 sm:pt-36 lg:pt-24 pb-12">
      {/* Atmospheric background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #FFF1F2 0%, #FFE4E6 45%, #FECDD3 100%)",
        }}
      >
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-red-300/25 blur-3xl" />
        <div className="absolute top-1/2 -right-16 h-64 w-64 rounded-full bg-amber-300/25 blur-3xl" />
        <div className="absolute inset-0 opacity-15">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, #DC2626 1px, transparent 0)`,
              backgroundSize: "34px 34px",
            }}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={introTransition}
            className="text-gray-800 order-2 lg:order-1"
          >
            <p className="inline-flex items-center rounded-full border border-red-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700 mb-4">
              Perjalanan Menata Pikiran
            </p>

            <h1 className="font-brand-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Dari check-in
              <span className="text-primary"> emosi </span>
              ke progres
              <span className="text-primary"> nyata</span>
            </h1>

            <p className="text-base md:text-lg text-gray-700 mb-8 max-w-xl leading-relaxed">
              Ruang Tenang bukan sekadar kumpulan fitur wellness. Kamu masuk, refleksi singkat,
              menyelesaikan langkah harian, membuka progress map, lalu melihat identitasmu tumbuh
              lewat reward dan komunitas.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 max-w-2xl">
              <div className="rounded-xl border border-red-200/70 bg-white/85 px-4 py-3">
                <p className="text-xs text-gray-500">Streak Aktif</p>
                <p className="text-lg font-semibold text-gray-900">7 Hari</p>
              </div>
              <div className="rounded-xl border border-red-200/70 bg-white/85 px-4 py-3">
                <p className="text-xs text-gray-500">Region Terbuka</p>
                <p className="text-lg font-semibold text-gray-900">3 dari 8</p>
              </div>
              <div className="rounded-xl border border-red-200/70 bg-white/85 px-4 py-3">
                <p className="text-xs text-gray-500">Tema Terbuka</p>
                <p className="text-lg font-semibold text-gray-900">Ocean Calm</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                Wow #1 Mood to Action
              </span>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Wow #2 Theme Shift
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={ROUTES.REGISTER}>
                <Button
                  size="lg"
                  className="bg-primary text-white hover:bg-red-600 font-semibold px-8 py-6 text-base rounded-[15px] shadow-lg hover:shadow-xl transition-all group"
                >
                  Mulai Perjalananmu
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href={ROUTES.LOGIN}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50 px-8 py-6 text-base rounded-[15px]"
                >
                  Lihat Dashboard Demo
                </Button>
              </Link>
            </div>

            <p className="text-sm text-gray-600 mt-4">
              Platform ini membantu refleksi diri, bukan pengganti layanan profesional.
            </p>
          </motion.div>

          {/* Right Content - Product theater */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={theaterTransition}
            className="relative order-1 lg:order-2"
          >
            <div className="relative rounded-3xl border border-red-200/70 bg-white/90 backdrop-blur-sm p-5 sm:p-6 shadow-2xl">
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-red-100">
                <div>
                  <p className="text-xs uppercase tracking-wide text-red-500 font-semibold">Hari Ini</p>
                  <h2 className="font-brand-display text-lg font-semibold text-gray-900">Journey Checkpoint</h2>
                </div>
                <div className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                  Lv 3 • 1240 EXP
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Progress Region Minggu Ini</span>
                    <span className="text-gray-500">68%</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full w-[68%] rounded-full bg-linear-to-r from-red-500 via-orange-500 to-amber-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <motion.div
                    animate={shouldReduceMotion ? undefined : { y: [0, -4, 0] }}
                    transition={shouldReduceMotion ? undefined : { duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
                    className="rounded-2xl border border-gray-200 bg-white p-3"
                  >
                    <p className="text-xs text-gray-500">Check-in Mood</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">Tenang Fokus</p>
                  </motion.div>

                  <motion.div
                    animate={shouldReduceMotion ? undefined : { y: [0, 4, 0] }}
                    transition={shouldReduceMotion ? undefined : { duration: 4.1, repeat: Infinity, ease: "easeInOut" }}
                    className="rounded-2xl border border-gray-200 bg-white p-3"
                  >
                    <p className="text-xs text-gray-500">Task Selesai</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">+120 EXP • +40 Koin</p>
                  </motion.div>

                  <motion.div
                    animate={shouldReduceMotion ? undefined : { y: [0, -3, 0] }}
                    transition={shouldReduceMotion ? undefined : { duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                    className="rounded-2xl border border-gray-200 bg-white p-3"
                  >
                    <p className="text-xs text-gray-500">Theme Unlock</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">Sunset Warmth</p>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-center gap-2">
                    <Map className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-800">Region &quot;Ruang Hening&quot; terbuka</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-600" />
                    <p className="text-sm text-amber-800">Misi guild: 3 dari 5 selesai</p>
                  </div>
                </div>
              </div>

              <motion.div
                animate={shouldReduceMotion ? undefined : { y: [0, -6, 0] }}
                transition={shouldReduceMotion ? undefined : { duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-4 top-20 hidden sm:flex items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-2 shadow-lg"
              >
                <Palette className="w-4 h-4 text-red-500" />
                <span className="text-xs font-medium text-gray-700">Atmosfer berubah seiring progres</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
