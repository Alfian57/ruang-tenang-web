"use client";

import Image from "next/image";
import { useState } from "react";
import { UserMood, MoodType } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils";
import { parseApiDate } from "@/utils/date";
import { MOOD_ASSETS, MOOD_ORDER } from "../mood-config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const moodColors: Record<MoodType, { bg: string; ring: string }> = {
  happy: { bg: "bg-emerald-50", ring: "ring-emerald-200" },
  neutral: { bg: "bg-amber-50", ring: "ring-amber-200" },
  angry: { bg: "bg-red-50", ring: "ring-red-200" },
  disappointed: { bg: "bg-orange-50", ring: "ring-orange-200" },
  sad: { bg: "bg-sky-50", ring: "ring-sky-200" },
  crying: { bg: "bg-violet-50", ring: "ring-violet-200" },
};

interface MoodCalendarProps {
  moods: UserMood[];
}

export function MoodCalendar({ moods }: MoodCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState<UserMood | null>(null);

  const daysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const firstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );

  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );

  const getDayMood = (day: number) => {
    const dayMoods = moods.filter((m) => {
      const mDate = parseApiDate(m.created_at);
      return (
        mDate.getDate() === day &&
        mDate.getMonth() === currentDate.getMonth() &&
        mDate.getFullYear() === currentDate.getFullYear()
      );
    });
    return dayMoods.length > 0 ? dayMoods[0] : null;
  };

  const today = new Date();
  const isCurrentMonth =
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear();

  const currentMonthName = currentDate.toLocaleString("id-ID", {
    month: "long",
  });
  const currentYear = currentDate.getFullYear();
  const totalDays = daysInMonth(currentDate);
  const startDay = firstDayOfMonth(currentDate);

  const emptyDays = Array.from({ length: startDay });
  const calendarDays = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Count moods for summary
  const moodCounts: Partial<Record<MoodType, number>> = {};
  moods.forEach((m) => {
    const mDate = parseApiDate(m.created_at);
    if (
      mDate.getMonth() === currentDate.getMonth() &&
      mDate.getFullYear() === currentDate.getFullYear()
    ) {
      moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
    }
  });
  const totalMoodsThisMonth = Object.values(moodCounts).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-gray-800">Kalender Mood</h3>
          <p className="text-xs sm:text-sm text-gray-500">
            {totalMoodsThisMonth > 0
              ? `${totalMoodsThisMonth} mood dicatat bulan ini`
              : "Jejak emosimu bulan ini"}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-gray-50 rounded-full px-1 py-1 border border-gray-100 shrink-0">
          <button
            onClick={prevMonth}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-500"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs sm:text-sm font-semibold px-1.5 sm:px-2.5 text-center text-gray-700 capitalize whitespace-nowrap">
            {currentMonthName} {currentYear}
          </span>
          <button
            onClick={nextMonth}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-500"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 mb-1.5">
        {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
          <div
            key={d}
            className="text-center text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className="h-12 sm:h-14" />
        ))}
        {calendarDays.map((day) => {
          const mood = getDayMood(day);
          const isToday = isCurrentMonth && day === today.getDate();
          const isPast =
            isCurrentMonth
              ? day < today.getDate()
              : currentDate < today;

          return (
            <button
              key={day}
              onClick={() => mood && setSelectedMood(mood)}
              disabled={!mood}
              className={cn(
                "h-12 sm:h-14 rounded-lg flex flex-col items-center justify-center transition-all duration-200 relative group border",
                mood
                  ? `${moodColors[mood.mood].bg} ring-1 ${moodColors[mood.mood].ring} hover:ring-2 hover:shadow-sm cursor-pointer`
                  : isPast
                    ? "bg-white border-dashed border-gray-200 text-gray-400"
                    : "bg-gray-50/40 border-gray-100 text-gray-400",
                isToday &&
                !mood &&
                "bg-primary/5 text-primary font-bold ring-1 ring-primary/30 border-primary/30",
                isToday &&
                mood &&
                "ring-2 ring-primary/50 shadow-sm"
              )}
            >
              {mood ? (
                <>
                  <div className="relative w-5 h-5 sm:w-6 sm:h-6">
                    <Image
                      src={MOOD_ASSETS[mood.mood].active}
                      alt={MOOD_ASSETS[mood.mood].label}
                      fill
                      sizes="24px"
                      className="object-contain"
                    />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-medium text-gray-500 mt-0.5 leading-none">
                    {day}
                  </span>
                </>
              ) : (
                <span
                  className={cn(
                    "text-xs sm:text-sm",
                    isToday && "text-primary font-bold"
                  )}
                >
                  {day}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center">
          {MOOD_ORDER.map((type) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="relative w-4 h-4">
                <Image
                  src={MOOD_ASSETS[type].active}
                  alt={MOOD_ASSETS[type].label}
                  fill
                  sizes="16px"
                  className="object-contain"
                />
              </div>
              <span className="text-[11px] text-gray-500 capitalize">
                {MOOD_ASSETS[type].label}
                {moodCounts[type]
                  ? ` (${moodCounts[type]})`
                  : ""}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedMood}
        onOpenChange={(open) => !open && setSelectedMood(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              Mood Kamu
            </DialogTitle>
            <DialogDescription>
              Detail catatan mood kamu pada tanggal ini
            </DialogDescription>
          </DialogHeader>

          {selectedMood && (
            <div className="flex flex-col items-center py-6 animate-in fade-in zoom-in duration-300">
              <div
                className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-lg",
                  moodColors[selectedMood.mood].bg
                )}
              >
                <div className="relative w-14 h-14">
                  <Image
                    src={MOOD_ASSETS[selectedMood.mood].active}
                    alt={MOOD_ASSETS[selectedMood.mood].label}
                    fill
                    sizes="56px"
                    className="object-contain"
                  />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1 capitalize">
                {MOOD_ASSETS[selectedMood.mood].label}
              </h2>
              <p className="text-sm text-gray-500 mb-6 font-medium">
                {parseApiDate(selectedMood.created_at).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center w-full">
                <p className="text-gray-700 italic text-sm">
                  {selectedMood.mood === "happy" &&
                    "Pertahankan semangat positif ini! Sebarkan kebahagiaanmu."}
                  {selectedMood.mood === "neutral" &&
                    "Hari yang tenang adalah fondasi yang baik untuk esok yang luar biasa."}
                  {(selectedMood.mood === "sad" ||
                    selectedMood.mood === "crying") &&
                    "Tidak apa-apa untuk merasa sedih. Badai pasti berlalu, kamu kuat."}
                  {(selectedMood.mood === "angry" ||
                    selectedMood.mood === "disappointed") &&
                    "Tarik napas dalam-dalam. Emosi ini valid, tapi jangan biarkan menguasaimu."}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-2">
            <DialogClose asChild>
              <Button variant="outline">Tutup</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
