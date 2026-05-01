"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { ArrowRight, Heart } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative overflow-hidden px-4 py-14 sm:py-16 md:py-20">
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #FFF1F2 0%, #FECACA 46%, #F87171 100%)",
        }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-white/35 via-transparent to-red-700/20" />

      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.08]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(0deg, rgba(127,29,29,0.32) 1px, transparent 1px), linear-gradient(90deg, rgba(127,29,29,0.32) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="container mx-auto max-w-3xl text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.2 }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/75 shadow-lg backdrop-blur-sm"
          >
            <Heart className="h-8 w-8 text-primary" fill="currentColor" />
          </motion.div>

          <h2 className="font-brand-display mb-5 text-2xl font-bold leading-tight text-gray-800 sm:text-3xl md:text-4xl lg:text-5xl">
            Siap untuk Merasa{" "}
            <span className="text-primary">Lebih Tenang</span> Hari Ini?
          </h2>

          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-gray-700 md:text-lg">
            Ruang Tenang-mu sudah siap. Mulai perjalanan merawat kesehatan
            mentalmu - gratis, aman, dan tanpa dihakimi.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={ROUTES.REGISTER}>
              <Button
                size="lg"
                className="w-full rounded-2xl bg-primary px-8 py-6 text-base font-semibold text-white shadow-xl transition-all hover:bg-primary/90 hover:shadow-2xl sm:w-auto sm:px-10 sm:py-7 sm:text-lg group"
              >
                Mulai Sekarang
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href={ROUTES.LOGIN}>
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-2xl border-2 border-red-200 px-8 py-6 text-base font-semibold text-gray-700 transition-all hover:bg-white/80 sm:w-auto sm:py-7 sm:text-lg"
              >
                Sudah Punya Akun
              </Button>
            </Link>
          </div>

          <p className="text-xs text-gray-500 mt-8">
            *Platform ini membantu refleksi diri, bukan menggantikan layanan
            profesional.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
