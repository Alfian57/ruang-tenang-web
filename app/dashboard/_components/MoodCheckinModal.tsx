"use client";

import Image from "next/image";
import { CalendarCheck, Lightbulb, Loader2 } from "lucide-react";
import type { MoodType } from "@/types";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MOOD_ASSETS, MOOD_ORDER } from "./mood-config";
import "./mood-checkin.css";

interface MoodCheckinModalProps {
  isOpen: boolean;
  onMoodSelected: (mood: MoodType) => void;
  isSubmitting: boolean;
  selectedMood: MoodType | null;
}

const moodOptions = MOOD_ORDER.map((type) => ({ type, ...MOOD_ASSETS[type] }));

export function MoodCheckinModal({ isOpen, onMoodSelected, isSubmitting, selectedMood }: MoodCheckinModalProps) {
  const { themeKey, isDefault } = useTheme();

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className={cn(
          !isDefault && `theme-${themeKey}`,
          "mood-checkin-dialog w-[calc(100%-1.25rem)] max-h-[calc(100dvh-1.25rem)] overflow-y-auto border-0 p-0 gap-0 sm:max-w-[40rem]"
        )}
        overlayClassName="bg-slate-950/55 backdrop-blur-[3px]"
        aria-describedby="mood-checkin-description"
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <div className="mood-checkin-hero">
          <div className="mood-checkin-hero-copy">
            <p className="mood-checkin-kicker"><CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" /> Check-in harian</p>
            <DialogHeader className="text-left">
              <DialogTitle className="mood-checkin-title">Halo, Apa Kabar?</DialogTitle>
              <DialogDescription id="mood-checkin-description" className="mood-checkin-description">
                Pelan-pelan, pilih perasaan yang paling dekat denganmu hari ini.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="mood-checkin-hero-art" aria-hidden="true">
            <Image
              src="/images/dashboard/mascot/checkin.webp"
              alt=""
              fill
              priority
              sizes="(max-width: 640px) 145px, 220px"
              className="object-contain object-bottom"
            />
          </div>
        </div>

        <div className="mood-checkin-body">
          <div className="mood-checkin-body-heading">
            <p className="text-sm font-bold text-slate-800">Apa yang kamu rasakan?</p>
            <p className="text-xs text-slate-500">Semua perasaan punya ruang di sini.</p>
          </div>

          <div className="mood-checkin-grid" aria-busy={isSubmitting}>
            {moodOptions.map((m) => (
              <button
                key={m.type}
                type="button"
                onClick={() => onMoodSelected(m.type)}
                disabled={isSubmitting}
                aria-busy={isSubmitting && selectedMood === m.type}
                className={cn("mood-checkin-choice", selectedMood === m.type && "mood-checkin-choice-selected")}
              >
                <span className="mood-checkin-choice-icon">
                  <Image src={m.active} alt="" fill sizes="52px" className="object-contain" />
                </span>
                <span className="mood-checkin-choice-label">{m.label}</span>
                {isSubmitting && selectedMood === m.type && <Loader2 className="mood-checkin-choice-spinner h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              </button>
            ))}
          </div>
          <span className="sr-only" role="status" aria-live="polite">
            {isSubmitting && selectedMood ? `Mencatat perasaan ${MOOD_ASSETS[selectedMood].label}...` : ""}
          </span>

          <p className="mood-checkin-footnote">
            <Lightbulb className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Rekomendasi untukmu akan mengikuti perasaan yang kamu catat.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
