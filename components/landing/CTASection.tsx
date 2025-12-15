"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
            Siap untuk merasa lebih tenang hari ini?
          </h2>
          
          <p className="text-gray-600 mb-10 max-w-xl mx-auto text-lg leading-relaxed">
            RuangTenang mu sudah siap. Mari bercerita, lepaskan beban, dan 
            temukan ketenangan tanpa takut dihakimi.
          </p>

          <Link href="/register">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-10 py-7 text-lg rounded-[15px] shadow-lg hover:shadow-xl transition-all"
            >
              Mulai Konsultasi Gratis
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
