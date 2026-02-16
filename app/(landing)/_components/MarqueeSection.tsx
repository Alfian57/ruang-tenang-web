"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const phrases = [
  "tumbuh kemudian",
  "Ceritakan, kami siap mendengarkan",
  "Sayangi dirimu, jaga pikiranmu",
  "Ruang aman",
];

export function MarqueeSection() {
  return (
    <section className="bg-primary py-4 overflow-hidden border-y border-gray-100">
      <div className="relative flex">
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* Repeat phrases multiple times for seamless loop */}
          {[...Array(4)].map((_, repeatIndex) => (
            <div key={repeatIndex} className="flex items-center gap-8">
              {phrases.map((phrase, index) => (
                <div key={`${repeatIndex}-${index}`} className="flex items-center gap-8">
                  <span className="text-white font-medium text-lg">
                    {phrase}
                  </span>
                    <span className="text-white text-xl"><Heart fill="white"/></span>
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
