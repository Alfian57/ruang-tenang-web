"use client";

import { useState } from "react";
import { UserMood, MoodType } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const moodEmojis: Record<MoodType, string> = {
  happy: "😊",
  neutral: "😐",
  angry: "😠",
  disappointed: "😞",
  sad: "😢",
  crying: "😭",
};

const moodColors: Record<MoodType, string> = {
  happy: "bg-green-100 text-green-700 border-green-200",
  neutral: "bg-yellow-100 text-yellow-700 border-yellow-200",
  angry: "bg-red-100 text-red-700 border-red-200",
  disappointed: "bg-orange-100 text-orange-700 border-orange-200",
  sad: "bg-blue-100 text-blue-700 border-blue-200",
  crying: "bg-purple-100 text-purple-700 border-purple-200",
};

const moodLabels: Record<MoodType, string> = {
  happy: "Bahagia",
  neutral: "Netral",
  angry: "Marah",
  disappointed: "Kecewa",
  sad: "Sedih",
  crying: "Menangis",
};

interface MoodCalendarProps {
  moods: UserMood[];
}

export function MoodCalendar({ moods }: MoodCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState<UserMood | null>(null);

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDayMood = (day: number) => {
    // Filter moods for this specific day
    const dayMoods = moods.filter(m => {
      const mDate = new Date(m.created_at);
      return (
        mDate.getDate() === day &&
        mDate.getMonth() === currentDate.getMonth() &&
        mDate.getFullYear() === currentDate.getFullYear()
      );
    });
    
    // Return the latest mood for the day if exists
    return dayMoods.length > 0 ? dayMoods[0] : null;
  };

  const currentMonthName = currentDate.toLocaleString("id-ID", { month: "long" });
  const currentYear = currentDate.getFullYear();
  const totalDays = daysInMonth(currentDate);
  const startDay = firstDayOfMonth(currentDate); // 0 = Sunday

  // Adjust for Monday start if desired (currently Sunday start standard)
  const emptyDays = Array.from({ length: startDay });
  const calendarDays = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
           <h3 className="font-bold text-lg text-gray-800">Kalender Mood</h3>
           <p className="text-sm text-gray-500">Jejak emosimu bulan ini</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1 border border-gray-100">
          <button 
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold w-32 text-center text-gray-700 capitalize">
            {currentMonthName} {currentYear}
          </span>
          <button 
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 flex-1">
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {calendarDays.map((day) => {
          const mood = getDayMood(day);
          const isToday = 
            day === new Date().getDate() && 
            currentDate.getMonth() === new Date().getMonth() &&
            currentDate.getFullYear() === new Date().getFullYear();

          return (
            <button
              key={day}
              onClick={() => mood && setSelectedMood(mood)}
              disabled={!mood}
              className={cn(
                "relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all group",
                mood 
                  ? `${moodColors[mood.mood]} hover:scale-105 cursor-pointer border` 
                  : "bg-gray-50 text-gray-400 border border-transparent",
                isToday && !mood && "border-primary/30 bg-primary/5 text-primary font-bold ring-2 ring-primary/20",
                isToday && mood && "ring-2 ring-offset-2 ring-primary"
              )}
            >
              <span className={cn("text-xs mb-1", mood ? "font-semibold" : "")}>{day}</span>
              {mood && (
                <span className="text-xl leading-none filter drop-shadow-sm transition-transform group-hover:scale-110">
                  {moodEmojis[mood.mood]}
                </span>
              )}
            </button>
          );
        })}
      </div>

       {/* Legend */}
       <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-3 justify-center">
        {Object.entries(moodEmojis).map(([type, emoji]) => (
           <div key={type} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-50 border border-gray-100">
             <span className="text-sm">{emoji}</span>
             <span className="text-xs text-gray-600 capitalize">{moodLabels[type as MoodType]}</span>
           </div>
        ))}
       </div>

      <Dialog open={!!selectedMood} onOpenChange={(open) => !open && setSelectedMood(null)}>
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
                <div className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center text-6xl mb-4 shadow-lg",
                  moodColors[selectedMood.mood].split(" ")[0] // Get bg color only
                )}>
                  {moodEmojis[selectedMood.mood]}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1 capitalize">
                  {moodLabels[selectedMood.mood]}
                </h2>
                <p className="text-sm text-gray-500 mb-6 font-medium">
                  {new Date(selectedMood.created_at).toLocaleDateString("id-ID", { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                
                {/* Motivational quote based on mood */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center w-full">
                   <p className="text-gray-700 italic">
                     {selectedMood.mood === 'happy' && "Pertahankan semangat positif ini! Sebarkan kebahagiaanmu."}
                     {selectedMood.mood === 'neutral' && "Hari yang tenang adalah fondasi yang baik untuk esok yang luar biasa."}
                     {(selectedMood.mood === 'sad' || selectedMood.mood === 'crying') && "Tidak apa-apa untuk merasa sedih. Badai pasti berlalu, kamu kuat."}
                     {(selectedMood.mood === 'angry' || selectedMood.mood === 'disappointed') && "Tarik napas dalam-dalam. Emosi ini valid, tapi jangan biarkan menguasaimu."}
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
