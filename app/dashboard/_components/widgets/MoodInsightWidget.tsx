"use client";

import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, HeartPulse, Sparkles } from "lucide-react";
import { MoodType, UserMood } from "@/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { parseApiDate } from "@/utils/date";
import { MOOD_ASSETS } from "../mood-config";

const MOOD_SCORES: Record<MoodType, number> = {
  happy: 5,
  neutral: 3,
  sad: 2,
  disappointed: 2,
  angry: 1,
  crying: 1,
};

const MOOD_ACTION_PLANS: Record<
  MoodType,
  {
    title: string;
    description: string;
    primaryAction: { label: string; href: string };
    secondaryAction: { label: string; href: string };
  }
> = {
  happy: {
    title: "Pertahankan energi positif",
    description: "Gunakan momen ini untuk memperkuat kebiasaan baik agar efeknya bertahan.",
    primaryAction: { label: "Catat Syukur di Jurnal", href: ROUTES.JOURNAL },
    secondaryAction: { label: "Bagikan Victory Note", href: ROUTES.FORUM },
  },
  neutral: {
    title: "Jaga ritme tetap stabil",
    description: "Mood netral adalah ruang bagus untuk planning kecil agar hari tetap terarah.",
    primaryAction: { label: "Check-in Jurnal 3 Menit", href: ROUTES.JOURNAL },
    secondaryAction: { label: "Set Prioritas via Chat AI", href: ROUTES.CHAT },
  },
  sad: {
    title: "Pulihkan perlahan, tidak perlu sempurna",
    description: "Mulai dari langkah ringan yang bisa mengurangi beban tanpa memaksa diri.",
    primaryAction: { label: "Atur Napas 2 Menit", href: ROUTES.BREATHING },
    secondaryAction: { label: "Curhat Aman di Chat", href: ROUTES.CHAT },
  },
  disappointed: {
    title: "Ubah kecewa jadi langkah konkret",
    description: "Validasi dulu perasaanmu, lalu pilih satu hal yang masih bisa kamu kendalikan.",
    primaryAction: { label: "Refleksi Penyebab di Jurnal", href: ROUTES.JOURNAL },
    secondaryAction: { label: "Minta Saran di Forum", href: ROUTES.FORUM },
  },
  angry: {
    title: "Turunkan intensitas emosi dulu",
    description: "Saat marah, jeda singkat membantu mencegah keputusan yang menyesal belakangan.",
    primaryAction: { label: "Grounding lewat Pernapasan", href: ROUTES.BREATHING },
    secondaryAction: { label: "Rilis Emosi ke Chat", href: ROUTES.CHAT },
  },
  crying: {
    title: "Prioritaskan rasa aman",
    description: "Kondisi ini butuh dukungan lembut. Ambil langkah paling sederhana yang menenangkan.",
    primaryAction: { label: "Teman Cerita AI", href: ROUTES.CHAT },
    secondaryAction: { label: "Tulis Beban di Jurnal", href: ROUTES.JOURNAL },
  },
};

interface MoodInsightWidgetProps {
  moods: UserMood[];
  isLoading?: boolean;
  activitySignals?: {
    key: string;
    label: string;
    count: number;
    href: string;
  }[];
}

export function MoodInsightWidget({ moods, isLoading, activitySignals = [] }: MoodInsightWidgetProps) {
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

  // Mood label mapping
  const moodLabels: Record<string, string> = {
    happy: "Senang",
    neutral: "Biasa",
    angry: "Marah",
    disappointed: "Kecewa",
    sad: "Sedih",
    crying: "Menangis"
  };

  const sortedMoods = [...moods].sort(
    (a, b) => parseApiDate(b.created_at).getTime() - parseApiDate(a.created_at).getTime(),
  );

  const moodCounts = sortedMoods.reduce((acc, mood) => {
    const label = moodLabels[mood.mood] || mood.mood;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  const lastMood = sortedMoods.length > 0 ? sortedMoods[0] : null;

  const recentWeek = sortedMoods.slice(0, 7);
  const previousWeek = sortedMoods.slice(7, 14);

  const averageScore = (entries: UserMood[]) => {
    if (!entries.length) return null;
    const total = entries.reduce((sum, mood) => sum + (MOOD_SCORES[mood.mood] ?? 0), 0);
    return total / entries.length;
  };

  const recentScore = averageScore(recentWeek);
  const previousScore = averageScore(previousWeek);

  let weeklyNarrative = "Isi mood tracker lebih rutin untuk melihat pola mingguanmu.";
  if (recentScore !== null && previousScore !== null) {
    const delta = recentScore - previousScore;
    if (delta >= 0.5) {
      weeklyNarrative = "Mood mingguanmu menunjukkan tren membaik. Pertahankan ritme kecil yang sudah berjalan.";
    } else if (delta <= -0.5) {
      weeklyNarrative = "Minggu ini terasa lebih berat dari sebelumnya. Fokus ke langkah pemulihan yang paling ringan dulu.";
    } else {
      weeklyNarrative = "Mood mingguanmu relatif stabil. Saatnya perkuat satu kebiasaan yang konsisten membantu.";
    }
  } else if (recentScore !== null) {
    weeklyNarrative = "Data minggu ini sudah terbentuk. Lanjutkan check-in agar rekomendasi makin akurat.";
  }

  const actionPlan = lastMood ? MOOD_ACTION_PLANS[lastMood.mood] : null;
  const strongestActivitySignal = [...activitySignals]
    .filter((signal) => signal.count > 0)
    .sort((a, b) => b.count - a.count)[0];

  const activityNarrative = strongestActivitySignal
    ? `Aktivitas paling dominan hari ini: ${strongestActivitySignal.label.toLowerCase()} (${strongestActivitySignal.count}x). Pertahankan ritme ini agar tren mood lebih stabil.`
    : "Belum ada pola aktivitas dominan. Coba mulai dari 1 aksi kecil agar insight mood lebih kontekstual.";

  return (
    <Card className="h-full flex flex-col border border-gray-100 shadow-sm bg-linear-to-br from-pink-50/50 to-white">
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
          <div className="text-center space-y-3">
            <div className="inline-flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-pink-100 w-full">
              <div className="relative w-12 h-12 mb-2">
                <Image
                  src={MOOD_ASSETS[lastMood.mood].active}
                  alt={MOOD_ASSETS[lastMood.mood].label}
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <p className="font-semibold text-gray-900">{moodLabels[lastMood.mood] || lastMood.mood}</p>
              <p className="text-xs text-gray-500">
                {format(parseApiDate(lastMood.created_at), "EEEE, d MMM HH:mm", { locale: id })}
              </p>
            </div>

            {dominantMood && sortedMoods.length > 5 && (
              <div className="flex items-center justify-center gap-2 text-xs text-pink-600 bg-pink-50 py-1.5 px-3 rounded-full">
                <Sparkles className="w-3 h-3" />
                <span>Kamu sering merasa <strong>{dominantMood[0]}</strong> minggu ini.</span>
              </div>
            )}

            <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">Storyline Minggu Ini</p>
              <p className="text-xs text-sky-900 mt-1 leading-relaxed">{weeklyNarrative}</p>
            </div>

            {actionPlan && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-700">Mood-to-Action</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{actionPlan.title}</p>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{actionPlan.description}</p>
                <div className="mt-3 grid gap-2">
                  <Link href={actionPlan.primaryAction.href}>
                    <Button size="sm" className="w-full justify-between">
                      {actionPlan.primaryAction.label}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                  <Link href={actionPlan.secondaryAction.href}>
                    <Button size="sm" variant="outline" className="w-full justify-between">
                      {actionPlan.secondaryAction.label}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Mood x Aktivitas</p>
              <p className="text-xs text-emerald-900 mt-1 leading-relaxed">{activityNarrative}</p>
              {strongestActivitySignal && (
                <Link href={strongestActivitySignal.href}>
                  <Button size="sm" variant="outline" className="w-full justify-between mt-3 border-emerald-200 bg-white hover:bg-emerald-100">
                    Lanjutkan {strongestActivitySignal.label}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 mb-3">Belum ada data mood.</p>
            <Link href={ROUTES.MOOD_TRACKER}>
              <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white rounded-full">
                Check-in Sekarang
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
