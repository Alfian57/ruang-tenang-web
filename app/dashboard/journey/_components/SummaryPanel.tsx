"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Trophy } from "lucide-react";
import { BadgeShowcase, PersonalJourneyCard, XPVisualizationsSection } from "@/components/shared/gamification";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { communityService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import type { PersonalJourney, UserBadges } from "@/types";
import { ROUTES } from "@/lib/routes";
import { DashboardMascotEmpty } from "@/components/shared/dashboard/DashboardMascotEmpty";

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
      <DashboardMascotEmpty image="/images/landing/mascot/map.webp" title="Perjalanan belum berhasil dimuat" description="Progresmu tetap tersimpan. Coba hubungkan kembali untuk melihatnya." action={<Button type="button" variant="outline" onClick={loadSummary}>Coba lagi</Button>} />
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
        <DashboardMascotEmpty image="/images/landing/mascot/map.webp" title="Ringkasan belum tersedia" description="Mulai satu langkah kecil hari ini, lalu lihat ceritanya tumbuh di sini." />
      )}
      <section className="theme-accent-border-soft rounded-3xl border bg-white/90 p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-theme-accent-soft text-theme-accent-dark">
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
        <section className="theme-accent-border-soft rounded-3xl border bg-white/90 p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-start gap-3 px-1">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-theme-accent-soft text-theme-accent-dark">
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
