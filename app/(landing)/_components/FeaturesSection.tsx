"use client";

import { motion } from "framer-motion";
import {
  MessageCircle,
  Heart,
  Music,
  Wind,
  Users,
  BookOpen,
} from "lucide-react";

const FEATURES = [
  {
    icon: MessageCircle,
    title: "AI Chat 24/7",
    description:
      "Teman curhat yang selalu siap mendengarkan. Berbasis AI yang empatik dan aman, kapanpun kamu butuhkan.",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: Heart,
    title: "Mood Tracker",
    description:
      "Pantau perasaanmu setiap hari. Kenali pola emosi dan temukan pemicu stres dengan visualisasi intuitif.",
    color: "from-rose-500 to-pink-500",
    bgColor: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  {
    icon: Music,
    title: "Musik Relaksasi",
    description:
      "Koleksi musik yang dikurasi untuk menenangkan pikiran. Buat playlist personal dan nikmati ketenangan.",
    color: "from-purple-500 to-violet-500",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    icon: Wind,
    title: "Latihan Pernapasan",
    description:
      "Teknik pernapasan terstruktur untuk meredakan kecemasan. Panduan visual yang mudah diikuti kapanpun.",
    color: "from-teal-500 to-emerald-500",
    bgColor: "bg-teal-50",
    iconColor: "text-teal-600",
  },
  {
    icon: Users,
    title: "Forum Komunitas",
    description:
      "Diskusi anonim dan aman tentang kesehatan mental. Saling dukung, berbagi pengalaman, tanpa dihakimi.",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: BookOpen,
    title: "Jurnal Pribadi",
    description:
      "Tulis perasaanmu dengan aman. Dilengkapi AI yang membantu refleksi diri dan memberikan insight personal.",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 bg-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl translate-y-1/2" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Fitur Lengkap
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Semua yang Kamu Butuhkan,{" "}
            <span className="text-primary">Dalam Satu Tempat</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Ruang Tenang menyediakan berbagai fitur untuk mendukung kesehatan
            mentalmu setiap hari.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="group relative bg-white rounded-2xl border border-gray-100 p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Gradient top accent on hover */}
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${feature.color} rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${feature.bgColor} group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
              </div>

              <h3 className="font-bold text-lg text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
