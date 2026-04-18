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

const SIGNATURE_LOOP = [
  {
    id: "01",
    icon: BookOpen,
    title: "Refleksi",
    description: "Mulai dari check-in emosi, lalu tulis 3 menit agar pikiran tidak berputar sendiri.",
    highlight: "Mood + Journal",
    href: `${ROUTES.JOURNAL}/create?mode=structured-reflection`,
    style: "from-rose-500 to-red-500",
  },
  {
    id: "02",
    icon: Compass,
    title: "Progres",
    description: "Langkah harian mengalir ke peta perjalanan sehingga kemajuan terasa nyata, bukan abstrak.",
    highlight: "Daily Task + Progress Map",
    href: ROUTES.PROGRESS_MAP,
    style: "from-amber-500 to-orange-500",
  },
  {
    id: "03",
    icon: Gift,
    title: "Reward Identitas",
    description: "Koin ditukar menjadi perubahan atmosfer dashboard, sehingga reward terasa hidup setiap hari.",
    highlight: "Theme Activation",
    href: ROUTES.REWARDS,
    style: "from-indigo-500 to-sky-500",
  },
  {
    id: "04",
    icon: Users,
    title: "Komunitas",
    description: "Misi bersama dan diskusi aman menjaga momentum agar pemulihan tidak berjalan sendirian.",
    highlight: "Shared Mission + Forum",
    href: ROUTES.DASHBOARD_COMMUNITY,
    style: "from-emerald-500 to-teal-500",
  },
];

const WOW_MOMENTS = [
  {
    title: "Wow Moment #1: Mood jadi arahan, bukan angka",
    description: "Setelah check-in, user langsung mendapat next step kontekstual ke jurnal, napas, atau chat.",
    cta: "Lihat Mood Insight",
    href: ROUTES.DASHBOARD,
  },
  {
    title: "Wow Moment #2: Reward mengubah suasana real-time",
    description: "Setelah claim theme, seluruh atmosfer dashboard berubah agar progres terasa personal.",
    cta: "Coba Klaim Theme",
    href: ROUTES.REWARDS,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(0deg, rgba(239,68,68,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,0.07) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
      </div>
      <div className="absolute -top-20 -right-12 h-72 w-72 rounded-full bg-rose-100/70 blur-3xl" />
      <div className="absolute -bottom-16 -left-10 h-72 w-72 rounded-full bg-orange-100/65 blur-3xl" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-200 bg-white text-rose-700 font-semibold text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            Signature Loop Experience
          </div>
          <h2 className="font-brand-display text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Bukan daftar fitur,
            <span className="text-primary"> tapi alur pemulihan yang menyatu</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Empat tahap inti ini didesain sebagai satu siklus berulang: refleksi, progres, reward identitas, lalu dukungan komunitas.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 rounded-3xl border border-rose-200/80 bg-white/90 p-5 md:p-7 shadow-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-rose-600">Core Loop</p>
                <h3 className="font-brand-display text-2xl font-bold text-gray-900 mt-1">
                  Refleksi {"->"} Progres {"->"} Reward {"->"} Komunitas
                </h3>
              </div>
              <div className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">30-90 detik demo</div>
            </div>

            <div className="space-y-4">
              {SIGNATURE_LOOP.map((stage, index) => (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -24 : 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="relative"
                >
                  {index < SIGNATURE_LOOP.length - 1 && (
                    <div className="absolute left-7 top-16 h-8 w-0.5 bg-linear-to-b from-rose-200 to-transparent" />
                  )}

                  <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-4 hover:border-rose-200 hover:shadow-md transition-all">
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
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{stage.highlight}</span>
                        <Link href={stage.href} className="text-sm font-semibold text-rose-700 hover:text-rose-600 inline-flex items-center gap-1">
                          Buka
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
                className="rounded-3xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm"
              >
                <div className="flex items-center gap-2 text-indigo-700">
                  <Trophy className="w-4 h-4" />
                  <p className="text-[11px] font-semibold uppercase tracking-wider">Showcase Peak</p>
                </div>
                <h4 className="font-brand-display text-xl font-bold text-gray-900 mt-2 leading-tight">{moment.title}</h4>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{moment.description}</p>
                <Link href={moment.href} className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 mt-4 hover:text-indigo-600">
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
              className="rounded-3xl border border-emerald-200 bg-linear-to-br from-emerald-50 via-white to-cyan-50 p-5 md:p-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                <MessageCircle className="w-3.5 h-3.5" />
                Fast Entry Point
              </div>
              <h4 className="font-brand-display text-lg font-bold text-gray-900 mt-3">Masuk lewat satu pertanyaan sederhana</h4>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                User tidak perlu memahami semua menu. Cukup pilih kondisi saat ini, lalu sistem mengantar ke langkah paling relevan.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link href={ROUTES.LOGIN}>
                  <Button className="w-full">Lihat Demo</Button>
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
