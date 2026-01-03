"use client";

import { motion } from "framer-motion";
import { Heart, MessageCircle, Music, BookOpen } from "lucide-react";
import Image from "next/image";

const FEATURES = [
  {
    icon: Heart,
    title: "Mood Tracker",
    description: "Pantau emosimu setiap hari untuk mengenali pola dan pemicu stres.",
    color: "bg-red-100 text-red-600",
  },
  {
    icon: MessageCircle,
    title: "Konsultasi AI",
    description: "Teman curhat pintar yang siap mendengarkan dan memberi saran 24/7.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Music,
    title: "Terapi Musik",
    description: "Koleksi musik relaksasi untuk membantumu fokus atau tidur lebih nyenyak.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: BookOpen,
    title: "Edukasi Mental",
    description: "Ribuan artikel dan tips praktis untuk menjaga kesehatan mentalmu.",
    color: "bg-green-100 text-green-600",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-20 lg:py-28 px-4 relative overflow-hidden bg-white">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-100/30 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          {/* Left Side: Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Tentang Ruang Tenang
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Sahabat Setia untuk <br />
              <span className="text-primary relative">
                Kesehatan Mentalmu
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h2>
            
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Kami percaya bahwa kesehatan mental sama pentingnya dengan kesehatan fisik. 
              Ruang Tenang hadir sebagai sanctuary digital yang aman, inklusif, dan mudah diakses 
              bagi mahasiswa yang ingin merawat pikiran dan hati mereka di tengah hiruk-pikuk kehidupan kampus.
            </p>

            <blockquote className="border-l-4 border-primary pl-6 italic text-gray-700 bg-gray-50 py-4 pr-4 rounded-r-lg">
              &quot;Menciptakan generasi yang tidak hanya cerdas secara intelektual, 
              tapi juga tangguh secara emosional.&quot;
            </blockquote>
          </motion.div>

          {/* Right Side: Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border-8 border-white">
              <Image
                src="/images/landing/about-illustration.png?v=realistic"
                alt="Tentang Ruang Tenang"
                width={600}
                height={500}
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Floating Stats Card */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 max-w-xs"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xl">
                98%
              </div>
              <div>
                <p className="font-bold text-gray-900">Pengguna Merasa Lebih Baik</p>
                <p className="text-xs text-gray-500">Berdasarkan survei internal</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
