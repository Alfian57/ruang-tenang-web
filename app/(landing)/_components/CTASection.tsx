"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Sparkles, Star } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #FEF2F2 0%, #FECACA 40%, #FED7AA 70%, #FEF3C7 100%)",
        }}
      />

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 opacity-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Star className="w-16 h-16 text-primary" />
        </motion.div>
      </div>
      <div className="absolute bottom-10 right-10 opacity-20">
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-20 h-20 text-orange-400" />
        </motion.div>
      </div>

      {/* Floating hearts */}
      <motion.div
        className="absolute top-1/4 right-1/4 opacity-10"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Heart className="w-12 h-12 text-primary" fill="currentColor" />
      </motion.div>
      <motion.div
        className="absolute bottom-1/3 left-1/4 opacity-10"
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Heart className="w-8 h-8 text-pink-400" fill="currentColor" />
      </motion.div>

      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #000 1px, transparent 0)`,
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
            className="w-20 h-20 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
          >
            <Heart className="w-10 h-10 text-primary" fill="currentColor" />
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6 leading-tight">
            Siap untuk Merasa{" "}
            <span className="text-primary">Lebih Tenang</span> Hari Ini?
          </h2>

          <p className="text-gray-600 mb-10 max-w-xl mx-auto text-lg leading-relaxed">
            Ruang Tenang-mu sudah siap. Mulai perjalanan merawat kesehatan
            mentalmu - gratis, aman, dan tanpa dihakimi.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-10 py-7 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all group"
              >
                Mulai Sekarang
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="font-semibold px-8 py-7 text-lg rounded-2xl border-2 border-gray-300 text-gray-700 hover:bg-white/80 transition-all"
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
