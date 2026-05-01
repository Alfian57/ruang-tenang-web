"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Loader2, RefreshCw, SmilePlus, Wind } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";
import { moodService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import type { MoodType, UserMood } from "@/types";

const MOOD_OPTIONS: Array<{ value: MoodType; label: string; emoji: string; tone: string }> = [
  { value: "happy", label: "Senang", emoji: "😊", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "neutral", label: "Netral", emoji: "😐", tone: "bg-slate-50 text-slate-700 border-slate-200" },
  { value: "angry", label: "Marah", emoji: "😠", tone: "bg-red-50 text-red-700 border-red-200" },
  { value: "disappointed", label: "Kecewa", emoji: "😞", tone: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "sad", label: "Sedih", emoji: "😢", tone: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "crying", label: "Menangis", emoji: "😭", tone: "bg-violet-50 text-violet-700 border-violet-200" },
];

const moodMap = new Map(MOOD_OPTIONS.map((item) => [item.value, item]));

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isToday(value?: string) {
  if (!value) return false;
  return new Date(value).toDateString() === new Date().toDateString();
}

export default function MoodTrackerPage() {
  const { token, refreshUser } = useAuthStore();
  const [moods, setMoods] = useState<UserMood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<MoodType | null>(null);

  const loadMoods = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await moodService.getHistory(token, { limit: 30 });
      setMoods(Array.isArray(response.data) ? response.data : []);
    } catch {
      toast.error("Gagal memuat riwayat mood");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadMoods();
  }, [loadMoods]);

  const todayMood = moods.find((mood) => isToday(mood.created_at)) ?? null;

  const distribution = useMemo(() => {
    const counts = new Map<MoodType, number>();
    moods.forEach((mood) => counts.set(mood.mood, (counts.get(mood.mood) ?? 0) + 1));
    const maxCount = Math.max(1, ...Array.from(counts.values()));
    return MOOD_OPTIONS.map((option) => ({
      ...option,
      count: counts.get(option.value) ?? 0,
      width: `${((counts.get(option.value) ?? 0) / maxCount) * 100}%`,
    }));
  }, [moods]);

  const handleRecordMood = async (mood: MoodType) => {
    if (!token || isSubmitting) return;
    setIsSubmitting(mood);
    try {
      await moodService.record(token, mood);
      await Promise.all([loadMoods(), refreshUser()]);
      toast.success("Mood hari ini berhasil dicatat");
    } catch {
      toast.error("Gagal mencatat mood");
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <section className="rounded-3xl border border-rose-100 bg-linear-to-br from-rose-50 via-white to-orange-50 p-5 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Mood Tracker</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">Pantau mood harianmu</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Catatan mood membantu dashboard, jurnal, dan rekomendasi aktivitas memahami pola emosimu dari waktu ke waktu.
            </p>
          </div>
          <Button variant="outline" className="gap-2 bg-white" onClick={() => void loadMoods()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SmilePlus className="h-5 w-5 text-primary" />
              Check-in hari ini
            </CardTitle>
            <CardDescription>Pilih satu kondisi yang paling mendekati perasaanmu saat ini.</CardDescription>
          </CardHeader>
          <CardContent>
            {todayMood && (
              <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  Kamu sudah check-in hari ini: {moodMap.get(todayMood.mood)?.label ?? todayMood.mood}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 md:grid-cols-3">
              {MOOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={Boolean(isSubmitting)}
                  onClick={() => void handleRecordMood(option.value)}
                  className={`rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-70 ${option.tone}`}
                >
                  <span className="text-3xl" aria-hidden="true">{option.emoji}</span>
                  <span className="mt-3 block text-sm font-semibold">{option.label}</span>
                  {isSubmitting === option.value && <Loader2 className="mt-2 h-4 w-4 animate-spin" />}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan 30 catatan</CardTitle>
            <CardDescription>Distribusi mood dari data terbaru yang tersedia.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {distribution.map((item) => (
              <div key={item.value}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-700">{item.emoji} {item.label}</span>
                  <Badge variant="muted">{item.count}</Badge>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-primary" style={{ width: item.width }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-slate-700" />
              Riwayat terbaru
            </CardTitle>
            <CardDescription>Data terbaru dari aktivitas mood tracking akunmu.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memuat riwayat mood...
              </div>
            ) : moods.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                Belum ada riwayat mood. Mulai dari check-in hari ini.
              </div>
            ) : (
              <div className="space-y-3">
                {moods.slice(0, 10).map((mood) => {
                  const option = moodMap.get(mood.mood);
                  return (
                    <div key={mood.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl" aria-hidden="true">{option?.emoji ?? mood.emoji}</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{option?.label ?? mood.mood}</p>
                          <p className="text-xs text-slate-500">{formatDate(mood.created_at)}</p>
                        </div>
                      </div>
                      {isToday(mood.created_at) && <Badge variant="success">Hari ini</Badge>}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Langkah pendukung</CardTitle>
            <CardDescription>Gunakan sinyal mood untuk lanjut ke aktivitas yang lebih membantu.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Link href={ROUTES.JOURNAL} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100">
              <p className="text-sm font-semibold text-slate-900">Tulis jurnal singkat</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">Ubah mood hari ini menjadi refleksi 3 menit.</p>
            </Link>
            <Link href={ROUTES.BREATHING} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Wind className="h-4 w-4 text-primary" />
                Latihan napas
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">Reset tubuh dengan sesi singkat yang terarah.</p>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
