"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const phrases = [
  "Mulai dari satu check-in kecil",
  "Ceritakan pelan-pelan",
  "Sayangi dirimu, jaga pikiranmu",
  "Ruang aman untuk refleksi",
];

const marqueeItems = Array.from({ length: 4 }, () => phrases).flat();

export function MarqueeSection() {
  return (
    <section className="overflow-hidden border-y border-red-700/20 bg-primary py-4" aria-label="Pesan dukungan Ruang Tenang">
      <div className="relative flex w-full">
        <motion.div
          className="flex w-max min-w-max shrink-0 items-center gap-8 whitespace-nowrap pr-8 sm:gap-12 sm:pr-12"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {[...marqueeItems, ...marqueeItems].map((phrase, index) => (
            <div key={`${phrase}-${index}`} className="flex shrink-0 items-center gap-3 sm:gap-4">
              <span className="block text-sm font-medium leading-none text-white sm:text-lg">
                {phrase}
              </span>
              <Heart className="h-4 w-4 shrink-0 text-white sm:h-5 sm:w-5" fill="white" aria-hidden="true" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
