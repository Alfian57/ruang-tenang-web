"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Image from "next/image";

export function AboutSection() {
  return (
    <section
      id="about"
      className="py-20 lg:py-28 px-4 relative overflow-hidden bg-linear-to-br from-primary via-red-500 to-red-600"
    >
      {/* Decorative white blobs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
      <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl" />
      <div className="absolute bottom-1/4 right-10 w-56 h-56 bg-white/5 rounded-full blur-2xl" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-white/80 text-3xl">✦</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Tentang Kami
            </h2>
            <span className="text-white/80 text-3xl">✦</span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Description Card */}
            <div className="bg-primary rounded-3xl p-8 text-white">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-3">
                Solusi Kesehatan Mental dalam Genggaman
              </h3>
              <p className="text-white/95 leading-relaxed mb-4">
                Ruang Tenang adalah platform kesehatan mental terintegrasi yang dirancang 
                khusus untuk mahasiswa. Kami menggabungkan kecanggihan dengan pendekatan 
                psikologis yang hangat untuk membantumu mengelola stres, overthinking, 
                hingga burnout.
              </p>
              <p className="text-white/95 leading-relaxed">
                Dengan fitur pelacak suasana hati harian, artikel pernapasan, terapi musik, 
                dan konsultasi AI yang responsif, kami membantumu mengenali pola emosi dan 
                mengambil langkah kecil menuju ketenangan, kapan pun Anda membutuhkannya.
              </p>
            </div>

            {/* Doctor/Team Illustration */}
            <div className="flex justify-center lg:justify-start">
              <Image
                src="/images/landing/about-2.png"
                alt="Mental Health Professional"
                width={300}
                height={380}
                className="object-contain"
              />
            </div>
          </motion.div>

          {/* Right Side - Mission Card and Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            {/* Team Illustration */}
            <div className="flex justify-center lg:justify-end">
              <Image
                src="/images/landing/about-1.png"
                alt="Our Team"
                width={400}
                height={300}
                className="object-contain"
              />
            </div>

            {/* Vision Box */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl px-8 pb-8 shadow-xl">
              <h3 className="font-bold text-gray-800 mb-4 text-xl">
                <Check className="w-5 h-5 rounded-full p-2" />
                Visi Kami
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Menciptakan ekosistem kampus yang lebih sehat secara mental. 
                Kami percaya bahwa setiap mahasiswa berhak mendapatkan dukungan 
                psikologis yang cepat, terjangkau, dan tanpa stigma. Ruang Tenang 
                hadir untuk memastikan tidak ada lagi mahasiswa yang harus berjuang 
                sendirian dalam kesenyapan.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
