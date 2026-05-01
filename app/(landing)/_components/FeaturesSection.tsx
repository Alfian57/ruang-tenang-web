"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import {
  ArrowRight,
  BookOpen,
  Compass,
  Gift,
  MessageCircle,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingDataNotice } from "./LandingDataNotice";

const SIGNATURE_LOOP = [
  {
    id: "01",
    icon: BookOpen,
    title: "Refleksi",
    description: "Mulai dari check-in emosi, lalu tulis 3 menit agar pikiran tidak berputar sendiri.",
    highlight: "Mood + Jurnal",
    href: `${ROUTES.JOURNAL}/create?mode=structured-reflection`,
    style: "from-rose-500 to-red-500",
  },
  {
    id: "02",
    icon: Compass,
    title: "Progres",
    description: "Langkah harian mengalir ke peta perjalanan sehingga kemajuan terasa nyata, bukan abstrak.",
    highlight: "Misi Harian + Peta Perjalanan",
    href: ROUTES.PROGRESS_MAP,
    style: "from-amber-500 to-orange-500",
  },
  {
    id: "03",
    icon: Gift,
    title: "Reward Identitas",
    description: "Koin ditukar menjadi perubahan atmosfer dashboard, sehingga reward terasa hidup setiap hari.",
    highlight: "Tema Dashboard",
    href: ROUTES.REWARDS,
    style: "from-red-500 to-rose-600",
  },
  {
    id: "04",
    icon: Users,
    title: "Komunitas",
    description: "Misi bersama dan diskusi aman menjaga momentum agar pemulihan tidak berjalan sendirian.",
    highlight: "Misi Bersama + Forum",
    href: ROUTES.DASHBOARD_COMMUNITY,
    style: "from-rose-600 to-red-700",
  },
];

const WOW_MOMENTS = [
  {
    title: "Momen utama #1: Mood jadi arahan, bukan angka",
    description: "Setelah check-in, pengguna langsung mendapat langkah berikutnya yang relevan ke jurnal, napas, atau chat.",
    cta: "Lihat Mood Insight",
    href: ROUTES.DASHBOARD,
  },
  {
    title: "Momen utama #2: Reward mengubah suasana dashboard",
    description: "Setelah klaim tema, atmosfer dashboard berubah agar progres terasa personal.",
    cta: "Coba Klaim Tema",
    href: ROUTES.REWARDS,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative overflow-hidden bg-linear-to-b from-white via-rose-50/40 to-white px-4 py-14 sm:py-16 md:py-20">
      <div className="absolute inset-0 opacity-25">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(0deg, rgba(239,68,68,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,0.07) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center md:mb-12"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm">
            <Sparkles className="w-4 h-4" />
            Alur Utama Ruang Tenang
          </div>
          <h2 className="font-brand-display mb-4 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl md:text-5xl">
            Bukan daftar fitur,
            <span className="text-primary"> tapi alur pemulihan yang menyatu</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
            Empat tahap inti ini didesain sebagai satu siklus berulang: refleksi, progres, reward identitas, lalu dukungan komunitas.
          </p>
          <div className="mt-5">
            <LandingDataNotice variant="demo" />
          </div>
        </motion.div>

        <div className="grid items-start gap-5 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7 rounded-3xl border border-rose-200/80 bg-white/95 p-5 shadow-xl shadow-red-950/5 md:p-7">
            <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-rose-600">Alur Utama</p>
                <h3 className="font-brand-display mt-1 text-xl font-bold leading-snug text-gray-900 sm:text-2xl">
                  Refleksi {"->"} Progres {"->"} Reward {"->"} Komunitas
                </h3>
              </div>
              <div className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">Simulasi alur</div>
            </div>

            <div className="space-y-4">
              {SIGNATURE_LOOP.map((stage, index) => (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="relative"
                >
                  {index < SIGNATURE_LOOP.length - 1 && (
                    <div className="absolute left-7 top-16 h-8 w-0.5 bg-linear-to-b from-rose-200 to-transparent" />
                  )}

                  <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:border-rose-200 hover:shadow-md sm:gap-4">
                    <div className={`h-11 w-11 rounded-2xl bg-linear-to-br ${stage.style} text-white shrink-0 grid place-items-center`}>
                      <stage.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-rose-600">Step {stage.id}</span>
                        <h4 className="text-lg font-semibold text-gray-900">{stage.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{stage.description}</p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="min-w-0 text-xs font-semibold uppercase tracking-wide text-gray-500">{stage.highlight}</span>
                        <Link href={stage.href} className="text-sm font-semibold text-rose-700 hover:text-rose-600 inline-flex items-center gap-1">
                          Lihat
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            {WOW_MOMENTS.map((moment, index) => (
              <motion.div
                key={moment.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                className="rounded-3xl border border-rose-100 bg-white p-5 shadow-sm shadow-red-950/5 md:p-6"
              >
                <div className="flex items-center gap-2 text-rose-700">
                  <Trophy className="w-4 h-4" />
                  <p className="text-[11px] font-semibold uppercase tracking-wider">Momen Utama</p>
                </div>
                <h4 className="font-brand-display text-xl font-bold text-gray-900 mt-2 leading-tight">{moment.title}</h4>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{moment.description}</p>
                <Link href={moment.href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-rose-700 hover:text-red-600">
                  {moment.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.32 }}
              className="rounded-3xl border border-rose-200 bg-linear-to-br from-rose-50 via-white to-red-50 p-5 md:p-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-700">
                <MessageCircle className="w-3.5 h-3.5" />
                Mulai Cepat
              </div>
              <h4 className="font-brand-display text-lg font-bold text-gray-900 mt-3">Masuk lewat satu pertanyaan sederhana</h4>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                User tidak perlu memahami semua menu. Cukup pilih kondisi saat ini, lalu sistem mengantar ke langkah paling relevan.
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Link href={ROUTES.LOGIN}>
                  <Button className="w-full">Masuk untuk mencoba</Button>
                </Link>
                <Link href={ROUTES.REGISTER}>
                  <Button variant="outline" className="w-full">Mulai Gratis</Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
