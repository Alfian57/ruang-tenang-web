"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-12">
      {/* Background - Pink gradient with decorative elements */}
      <div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #FEF2F2 0%, #FECACA 50%, #FEF2F2 100%)",
        }}
      >
        {/* Decorative dot pattern */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, #EF4444 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-800 order-2 lg:order-1"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Ruang <span className="text-primary">Aman</span> untuk
              <br />
              Menata Kembali
              <br />
              <span className="text-primary">Pikiranmu</span>
            </h1>

            <p className="text-base md:text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
              Platform kesehatan mental berbasis AI yang dirancang khusus untuk mahasiswa. 
              Dari teman ngobrol yang empatik hingga fitur meditasi, semua ada dalam satu genggaman 
              untuk menjaga kesehatan emosionalmu.
            </p>

            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                *Platform ini membantu refleksi diri, bukan menggantikan layanan profesional.
              </p>
              
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-primary text-white hover:bg-red-600 font-semibold px-8 py-6 text-base rounded-[15px] shadow-lg hover:shadow-xl transition-all group"
                >
                  Masuk ke Ruang Tenang
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right Content - Hero Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative flex justify-center lg:justify-end order-1 lg:order-2"
          >
            <div className="relative w-full max-w-md lg:max-w-lg">
              {/* Main hero illustration */}
              <Image
                src="/images/landing/about-doctor.png"
                alt="Ruang Tenang App"
                width={500}
                height={600}
                className="relative z-10 w-full h-auto drop-shadow-2xl"
                priority
              />

              {/* Floating elements */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-4 right-0 lg:right-4"
              >
                <div className="bg-white rounded-2xl p-3 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">💝</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Mood Tracker</p>
                      <p className="text-xs text-gray-500">Pantau perasaanmu</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 12, 0],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute bottom-24 left-0"
              >
                <div className="bg-white rounded-2xl p-3 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">💬</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">AI Chat</p>
                      <p className="text-xs text-gray-500">Tersedia 24/7</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-1/3 right-0 lg:-right-4"
              >
                <div className="bg-white rounded-2xl p-3 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🎵</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Relaksasi</p>
                      <p className="text-xs text-gray-500">Musik menenangkan</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
