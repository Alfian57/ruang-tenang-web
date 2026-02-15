"use client";

import Image from "next/image";
import { Heart, Stethoscope, Pill } from "lucide-react";
import { motion } from "framer-motion";

interface AuthIllustrationProps {
  title: string;
  description: string;
}

export function AuthIllustration({ title, description, visual, floatingElements }: AuthIllustrationProps & { visual?: React.ReactNode; floatingElements?: React.ReactNode }) {
  return (
    <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-red-600 via-rose-500 to-orange-400">
      {/* Decorative circles/blobs */}
      <div className="absolute top-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-32 left-20 w-64 h-64 bg-white/10 rounded-full blur-2xl animate-pulse-slow delay-700" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-linear-to-b from-transparent to-black/10 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white h-full">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
           className="text-center"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 drop-shadow-md">{title}</h2>
          <p className="text-center text-white/95 max-w-lg leading-relaxed mb-12 text-lg drop-shadow-sm font-medium">
            {description}
          </p>
        </motion.div>

        {/* Illustration */}
        <div className="relative">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-10"
          >
            {visual ? visual : (
              <Image
                src="/images/landing/about-doctor.png"
                alt="RuangTenang App"
                width={400}
                height={500}
                className="object-contain drop-shadow-2xl"
                priority
              />
            )}
          </motion.div>
          
          {/* Floating icons with animation */}
          {floatingElements ? floatingElements : (
            <>
              <FloatingIcon className="top-0 right-0" delay={0}>
                 <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
              </FloatingIcon>
              
              <FloatingIcon className="bottom-20 -left-8" delay={1.5}>
                <Stethoscope className="w-8 h-8 text-blue-500" />
              </FloatingIcon>
              
              <FloatingIcon className="top-1/2 -right-8" delay={0.8}>
                <Pill className="w-8 h-8 text-orange-500" />
              </FloatingIcon>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function FloatingIcon({ children, className, delay }: { children: React.ReactNode, className?: string, delay: number }) {
  return (
    <motion.div
      className={`absolute bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/50 ${className} z-20`}
      initial={{ y: 0 }}
      animate={{ y: [-10, 10, -10] }}
      transition={{ 
        repeat: Infinity, 
        duration: 4, 
        ease: "easeInOut",
        delay: delay 
      }}
      whileHover={{ scale: 1.1 }}
    >
      {children}
    </motion.div>
  );
}
