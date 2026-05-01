"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { useAuthStore } from "@/store/authStore";
import {
  ArrowRight,
  HeartPulse,
  LockKeyhole,
  MessageCircle,
  Music2,
  ShieldCheck,
} from "lucide-react";

const HERO_FLOATING_CARDS = [
  {
    icon: HeartPulse,
    title: "Mood Tracker",
    description: "Pantau perasaanmu",
    className: "right-0 top-2 sm:-top-3 lg:right-2",
    animate: { y: [0, -14, 0] },
    duration: 4,
  },
  {
    icon: MessageCircle,
    title: "AI Chat",
    description: "Teman refleksi 24/7",
    className: "bottom-12 left-0 sm:bottom-20",
    animate: { y: [0, 12, 0] },
    duration: 3.6,
  },
  {
    icon: Music2,
    title: "Relaksasi",
    description: "Musik menenangkan",
    className: "right-0 top-[43%] lg:right-0",
    animate: { y: [0, -10, 0] },
    duration: 5,
  },
];

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const { isAuthenticated } = useAuthStore();

  const introTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.6, delay: 0.2 };
  const visualTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.6, delay: 0.35 };

  return (
    <section id="home" className="relative min-h-[88svh] overflow-hidden bg-rose-50 pt-24 pb-10 sm:pt-32 sm:pb-12 lg:pt-28">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #FFF1F2 0%, #FFE4E6 48%, #FFF7F7 100%)",
        }}
      />
      <div className="absolute inset-0 bg-linear-to-br from-white/30 via-transparent to-red-100/60" />
      <div className="absolute inset-0 opacity-[0.16]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(0deg, rgba(220,38,38,0.24) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.24) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-[calc(88svh-6rem)] min-w-0 items-center gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-10 xl:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={introTransition}
            className="order-2 min-w-0 text-gray-900 lg:order-1"
          >
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/85 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-red-700 shadow-sm backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              Ruang aman untuk mahasiswa
            </p>

            <h1 className="font-brand-display mb-4 text-3xl font-bold leading-tight min-[380px]:text-4xl sm:mb-5 sm:text-5xl md:text-6xl">
              Ruang <span className="text-primary">Aman</span> untuk
              <br />
              Menata Kembali
              <br />
              <span className="text-primary">Pikiranmu</span>
            </h1>

            <p className="mb-4 max-w-xl text-sm leading-relaxed text-gray-700 sm:mb-5 sm:text-base md:text-lg">
              Platform kesehatan mental berbasis AI untuk mahasiswa. Mulai dari mood tracker,
              jurnal refleksi, chat AI, latihan pernapasan, sampai musik relaksasi dalam satu
              alur yang mudah diikuti.
            </p>

            <div className="mb-5 flex flex-wrap gap-2 text-xs text-gray-700 sm:mb-7 sm:text-sm">
              <span className="inline-flex items-center gap-2 rounded-lg border border-red-100 bg-white/80 px-2.5 py-2 shadow-sm backdrop-blur sm:px-3">
                <LockKeyhole className="h-4 w-4 text-red-600" />
                Data pribadi baru muncul setelah login
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-red-100 bg-white/80 px-2.5 py-2 shadow-sm backdrop-blur sm:px-3">
                <MessageCircle className="h-4 w-4 text-red-600" />
                AI untuk refleksi, bukan diagnosis
              </span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={ROUTES.REGISTER}>
                <Button
                  size="lg"
                  className="h-12 w-full rounded-[15px] bg-primary px-6 text-base font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-600 hover:shadow-xl sm:w-auto sm:px-8"
                >
                  Masuk ke Ruang Tenang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-[15px] border-red-200 bg-white/75 px-6 text-base font-semibold text-red-700 hover:bg-red-50 sm:w-auto sm:px-8"
                >
                  {isAuthenticated ? "Buka Dashboard" : "Sudah Punya Akun"}
                </Button>
              </Link>
            </div>

            <p className="mt-4 max-w-lg text-sm leading-relaxed text-gray-600">
              Landing page ini hanya pengantar fitur. Mood, jurnal, dan percakapan Anda tidak
              dibaca atau ditampilkan sebelum login.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={visualTransition}
            className="order-1 flex min-w-0 justify-center lg:order-2 lg:justify-end"
          >
            <div className="relative w-full max-w-[258px] min-[380px]:max-w-[310px] sm:max-w-md lg:max-w-[500px] xl:max-w-[540px]">
              <Image
                src="/images/landing/about-doctor.png"
                alt="Ilustrasi aplikasi Ruang Tenang dengan pendamping kesehatan di layar ponsel."
                width={500}
                height={600}
                className="relative z-10 h-auto w-full drop-shadow-2xl"
                sizes="(max-width: 640px) 330px, (max-width: 1024px) 448px, 560px"
                priority
              />

              {HERO_FLOATING_CARDS.map((card) => (
                <motion.div
                  key={card.title}
                  animate={shouldReduceMotion ? undefined : card.animate}
                  transition={
                    shouldReduceMotion
                      ? undefined
                      : { duration: card.duration, repeat: Infinity, ease: "easeInOut" }
                  }
                  className={`absolute z-20 ${card.className}`}
                >
                  <div className="rounded-2xl border border-red-100 bg-white/95 p-2.5 shadow-xl shadow-red-900/10 backdrop-blur sm:p-3">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-red-600 sm:h-12 sm:w-12">
                        <card.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900 sm:text-sm">{card.title}</p>
                        <p className="text-[11px] text-gray-500 sm:text-xs">{card.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
