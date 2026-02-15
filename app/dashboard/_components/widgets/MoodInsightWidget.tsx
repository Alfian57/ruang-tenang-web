"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, HeartPulse, Sparkles } from "lucide-react";
import { UserMood } from "@/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { parseApiDate } from "@/lib/utils/date";

interface MoodInsightWidgetProps {
  moods: UserMood[];
  isLoading?: boolean;
}

export function MoodInsightWidget({ moods, isLoading }: MoodInsightWidgetProps) {
  if (isLoading) {
    return (
       <Card className="h-full border-none shadow-sm flex flex-col">
         <CardHeader>
           <div className="h-6 w-1/3 bg-gray-100 rounded animate-pulse" />
         </CardHeader>
         <CardContent className="flex-1">
             <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
         </CardContent>
       </Card>
    );
  }

  // Calculate most frequent mood
  // Mood label mapping
  const moodLabels: Record<string, string> = {
    happy: "Senang",
    neutral: "Biasa",
    angry: "Marah",
    disappointed: "Kecewa",
    sad: "Sedih",
    crying: "Menangis"
  };

  // Calculate most frequent mood
  const moodCounts = moods.reduce((acc, mood) => {
    const label = moodLabels[mood.mood] || mood.mood;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  const lastMood = moods.length > 0 ? moods[0] : null;

  return (
    <Card className="h-full flex flex-col border border-gray-100 shadow-sm bg-gradient-to-br from-pink-50/50 to-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
          <HeartPulse className="w-5 h-5 text-pink-500" />
          Mood Insight
        </CardTitle>
        <Link href={ROUTES.JOURNAL}>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-pink-600">
            Detail <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        {lastMood ? (
          <div className="text-center">
             <div className="inline-flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-pink-100 mb-3 w-full">
                 <span className="text-4xl mb-2">{lastMood.emoji}</span>
                 <p className="font-semibold text-gray-900">{moodLabels[lastMood.mood] || lastMood.mood}</p>
                 <p className="text-xs text-gray-500">
                     {format(parseApiDate(lastMood.created_at), "EEEE, d MMM HH:mm", { locale: id })}
                 </p>
             </div>
             
             {dominantMood && moods.length > 5 && (
                 <div className="flex items-center justify-center gap-2 text-xs text-pink-600 bg-pink-50 py-1.5 px-3 rounded-full">
                     <Sparkles className="w-3 h-3" />
                     <span>Kamu sering merasa <strong>{dominantMood[0]}</strong> minggu ini.</span>
                 </div>
             )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 mb-3">Belum ada data mood.</p>
            <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white rounded-full">
                Check-in Sekarang
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
