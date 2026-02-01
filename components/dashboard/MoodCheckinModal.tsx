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

const moodEmojis: { type: MoodType; label: string; active: string; inactive: string }[] = [
  { type: "happy", label: "Bahagia", active: "/images/1-happy-active.png", inactive: "/images/1-smile.png" },
  { type: "neutral", label: "Netral", active: "/images/2-netral-active.png", inactive: "/images/2-netral.png" },
  { type: "sad", label: "Sedih", active: "/images/5-sad-active.png", inactive: "/images/5-sad.png" },
  { type: "disappointed", label: "Kecewa", active: "/images/4-disappointed-active.png", inactive: "/images/4-disappointed.png" },
  { type: "angry", label: "Marah", active: "/images/3-angry-active.png", inactive: "/images/3-angry.png" },
  { type: "crying", label: "Menangis", active: "/images/6-cry-active.png", inactive: "/images/6-cry.png" },
];

export function MoodCheckinModal({ isOpen, onMoodSelected, isSubmitting }: MoodCheckinModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="[&>button]:hidden sm:max-w-md bg-white rounded-2xl p-0 overflow-hidden border-0 shadow-xl gap-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header with primary gradient - consistent with dashboard banner */}
        <div className="gradient-primary p-6 text-center rounded-t-2xl">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
            <span className="text-3xl">👋</span>
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white text-center">
              Halo, Apa Kabar?
            </DialogTitle>
            <DialogDescription className="text-white/80 text-center text-sm mt-1">
              Yuk catat perasaanmu hari ini
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Mood Selection Grid */}
        <div className="p-5">
          <div className="grid grid-cols-3 gap-3">
            {moodEmojis.map((m) => (
              <button
                key={m.type}
                onClick={() => onMoodSelected(m.type)}
                disabled={isSubmitting}
                className="group flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-red-50 transition-all duration-200 mood-btn border border-transparent hover:border-red-200 hover:shadow-md"
              >
                <div className="w-12 h-12 relative mb-2">
                  {/* Show colored (active) emotes by default */}
                  <Image 
                    src={m.active} 
                    alt={m.label} 
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-medium text-gray-600 group-hover:text-primary transition-colors">
                  {m.label}
                </span>
              </button>
            ))}
          </div>
          
          <p className="text-xs text-center text-gray-400 mt-4">
            Rekomendasi konten akan disesuaikan dengan mood-mu ✨
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
