"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Heart, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { UserMood, MoodType } from "@/types";
import { getMoodLabel, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const moods: { type: MoodType; label: string; active: string; inactive: string }[] = [
  { type: "happy", label: "Bahagia", active: "/images/1-happy-active.png", inactive: "/images/1-smile.png" },
  { type: "neutral", label: "Netral", active: "/images/2-netral-active.png", inactive: "/images/2-netral.png" },
  { type: "angry", label: "Marah", active: "/images/3-angry-active.png", inactive: "/images/3-angry.png" },
  { type: "disappointed", label: "Kecewa", active: "/images/4-disappointed-active.png", inactive: "/images/4-disappointed.png" },
  { type: "sad", label: "Sedih", active: "/images/5-sad-active.png", inactive: "/images/5-sad.png" },
  { type: "crying", label: "Menangis", active: "/images/6-cry-active.png", inactive: "/images/6-cry.png" },
];

const moodEmojis: Record<MoodType, string> = {
  happy: "😊",
  neutral: "😐",
  angry: "😠",
  disappointed: "😞",
  sad: "😢",
  crying: "😭",
};

export default function MoodPage() {
  const { token } = useAuthStore();
  const [history, setHistory] = useState<UserMood[]>([]);
  const [latestMood, setLatestMood] = useState<UserMood | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);

  const loadMoodData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [historyRes, latestRes] = await Promise.all([
        api.getMoodHistory(token, { limit: 30 }) as Promise<{ data: { moods: UserMood[] } }>,
        api.getLatestMood(token).catch(() => null) as Promise<{ data: UserMood } | null>,
      ]);
      setHistory(historyRes?.data?.moods || []);
      setLatestMood(latestRes?.data || null);
      if (latestRes?.data) {
        setSelectedMood(latestRes.data.mood);
      }
    } catch (error) {
      console.error("Failed to load mood data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadMoodData();
    }
  }, [token, loadMoodData]);

  const recordMood = async (mood: MoodType) => {
    if (!token || isRecording) return;
    setIsRecording(true);
    setSelectedMood(mood);
    try {
      await api.recordMood(token, mood);
      loadMoodData();
    } catch (error) {
      console.error("Failed to record mood:", error);
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Record Mood */}
      <Card className="gradient-primary-soft border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Heart className="w-5 h-5 text-primary" />
            Bagaimana perasaanmu hari ini?
          </CardTitle>
          <CardDescription>
            Pilih salah satu emoji yang paling menggambarkan perasaanmu saat ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {moods.map((mood) => (
              <button
                key={mood.type}
                onClick={() => recordMood(mood.type)}
                disabled={isRecording}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-2xl transition-all mood-btn bg-white",
                  selectedMood === mood.type 
                    ? "ring-2 ring-primary shadow-lg" 
                    : "hover:shadow-md",
                  isRecording && "opacity-50 cursor-not-allowed"
                )}
              >
                <Image 
                  src={selectedMood === mood.type ? mood.active : mood.inactive}
                  alt={mood.label}
                  width={48}
                  height={48}
                  className="mb-2"
                />
                <span className="text-sm font-medium text-gray-700">{mood.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Latest Mood */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mood Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {latestMood ? (
              <div className="text-center">
                <span className="text-6xl mb-4 block">{moodEmojis[latestMood.mood]}</span>
                <p className="font-semibold text-gray-800">{getMoodLabel(latestMood.mood)}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(latestMood.created_at)}
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Belum ada mood tercatat</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mood History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5" />
              Riwayat Mood
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3 mb-1" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {history.map((mood) => (
                  <div
                    key={mood.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-3xl">{moodEmojis[mood.mood]}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{getMoodLabel(mood.mood)}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(mood.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">
                  Belum ada riwayat mood
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
