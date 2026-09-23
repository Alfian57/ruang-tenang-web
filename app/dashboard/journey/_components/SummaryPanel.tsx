"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, RefreshCw, Trophy } from "lucide-react";
import { BadgeShowcase, PersonalJourneyCard, XPVisualizationsSection } from "@/components/shared/gamification";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { communityService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import type { PersonalJourney, UserBadges } from "@/types";
import { ROUTES } from "@/lib/routes";

export default function SummaryPanel() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [journey, setJourney] = useState<PersonalJourney | null>(null);
  const [badges, setBadges] = useState<UserBadges | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadSummary = useCallback(() => {
    let active = true;
    if (!token) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setHasError(false);
    Promise.all([
      communityService.getPersonalJourney(token),
      communityService.getUserBadges(token),
    ])
      .then(([journeyRes, badgesRes]) => {
        if (!active) return;
        setJourney(journeyRes.data);
        setBadges(badgesRes.data);
      })
      .catch(() => {
        if (!active) return;
        setJourney(null);
        setBadges(null);
        setHasError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => loadSummary(), [loadSummary]);

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-96 w-full rounded-3xl" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-72 w-full rounded-3xl" />
          <Skeleton className="h-72 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (hasError && !journey) {
    return (
      <div className="rounded-3xl border border-dashed border-primary/25 bg-white/80 px-6 py-16 text-center shadow-sm">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <RefreshCw className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">Perjalanan belum berhasil dimuat</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Coba hubungkan kembali untuk melihat level, XP, dan pencapaianmu.</p>
        <Button type="button" variant="outline" className="mt-5 rounded-xl" onClick={loadSummary}>
          Coba lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {journey ? (
        <PersonalJourneyCard
          journey={journey}
          onShowLevelGuide={() => router.push(ROUTES.journeyTab("map"))}
          onShowRewards={() => router.push(ROUTES.journeyTab("rewards"))}
        />
      ) : (
        <div className="rounded-xl border bg-white p-8 text-center text-sm text-gray-500">
          Ringkasan perjalanan belum tersedia.
        </div>
      )}
      <section className="rounded-3xl border border-white/80 bg-white/85 p-4 shadow-sm backdrop-blur sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-600">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-950">Jejak aktivitasmu</h2>
            <p className="mt-0.5 text-sm text-slate-500">Setiap langkah kecil membentuk pola pertumbuhan yang bisa kamu lihat kembali.</p>
          </div>
        </div>
        <XPVisualizationsSection />
      </section>

      {badges ? (
        <section>
          <div className="mb-4 flex items-start gap-3 px-1">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-600">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-950">Galeri pencapaian</h2>
              <p className="mt-0.5 text-sm text-slate-500">Badge menjadi penanda momen penting sepanjang perjalananmu.</p>
            </div>
          </div>
          <BadgeShowcase badges={badges} />
        </section>
      ) : null}
    </div>
  );
}
