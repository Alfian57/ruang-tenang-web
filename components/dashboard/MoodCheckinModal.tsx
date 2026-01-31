"use client";

import Image from "next/image";
import { MoodType } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface MoodCheckinModalProps {
  isOpen: boolean;
  onMoodSelected: (mood: MoodType) => void;
  isSubmitting: boolean;
}

const moodEmojis: { type: MoodType; emoji: string; label: string; active: string; inactive: string; color: string }[] = [
  { type: "happy", emoji: "😊", label: "Bahagia", active: "/images/1-happy-active.png", inactive: "/images/1-smile.png", color: "#22c55e" },
  { type: "neutral", emoji: "😐", label: "Netral", active: "/images/2-netral-active.png", inactive: "/images/2-netral.png", color: "#eab308" },
  { type: "angry", emoji: "😠", label: "Marah", active: "/images/3-angry-active.png", inactive: "/images/3-angry.png", color: "#ef4444" },
  { type: "disappointed", emoji: "😞", label: "Kecewa", active: "/images/4-disappointed-active.png", inactive: "/images/4-disappointed.png", color: "#f97316" },
  { type: "sad", emoji: "😢", label: "Sedih", active: "/images/5-sad-active.png", inactive: "/images/5-sad.png", color: "#3b82f6" },
  { type: "crying", emoji: "😭", label: "Menangis", active: "/images/6-cry-active.png", inactive: "/images/6-cry.png", color: "#8b5cf6" },
];

export function MoodCheckinModal({ isOpen, onMoodSelected, isSubmitting }: MoodCheckinModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="[&>button]:hidden sm:max-w-md bg-white rounded-3xl p-0 overflow-hidden border-0 shadow-2xl gap-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-400 via-purple-400 to-pink-400" />
          
          <div className="p-6 md:p-8 text-center">
            <DialogHeader className="mb-6">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">👋</span>
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-800 mb-2 text-center">
                Selamat Datang Kembali!
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-center">
                Sebelum memulai aktivitas, yuk catat dulu gimana perasaanmu hari ini?
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-4 mb-4 overflow-visible">
              {moodEmojis.map((m) => (
                <button
                  key={m.type}
                  onClick={() => onMoodSelected(m.type)}
                  disabled={isSubmitting}
                  className="group relative flex flex-col items-center justify-center p-4 rounded-2xl hover:bg-gray-50 transition-all border-2 border-transparent hover:border-gray-100 overflow-visible"
                >
                  <div className="w-16 h-16 relative mb-2 transition-transform group-hover:scale-125 overflow-visible">
                    <Image 
                      src={m.inactive} 
                      alt={m.label} 
                      fill
                      sizes="64px"
                      className="object-contain drop-shadow-sm group-hover:opacity-0 transition-opacity absolute inset-0"
                    />
                    <Image 
                      src={m.active} 
                      alt={m.label} 
                      fill
                      sizes="64px"
                      className="object-contain drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
            
            <p className="text-xs text-center text-gray-400 mt-4">
              Penyetelan mood ini membantu kami merekomendasikan konten yang tepat untukmu.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
