"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Compass, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { wellnessService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/utils";

type TourStep = {
  route: string;
  target: string;
  eyebrow: string;
  title: string;
  description: string;
};

type TargetRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const TOUR_STEPS: TourStep[] = [
  {
    route: ROUTES.DASHBOARD,
    target: "user-mood",
    eyebrow: "Mood",
    title: "Baca pola mood",
    description: "Mood insight menjadi sinyal awal untuk rekomendasi dashboard, rencana 7 hari, dan laporan mingguan.",
  },
  {
    route: ROUTES.DASHBOARD,
    target: "user-journal",
    eyebrow: "Jurnal",
    title: "Tulis refleksi singkat",
    description: "Jurnal membantu sistem memahami konteks emosi tanpa harus membuka semua fitur sekaligus.",
  },
  {
    route: ROUTES.DASHBOARD,
    target: "user-chat-ai",
    eyebrow: "AI",
    title: "Lanjutkan ke Teman Cerita AI",
    description: "Chat AI dipakai sebagai langkah refleksi lanjutan saat kamu ingin merapikan isi pikiran.",
  },
  {
    route: ROUTES.DASHBOARD,
    target: "user-breathing",
    eyebrow: "Breathing",
    title: "Tenangkan tubuh dulu",
    description: "Sesi napas singkat menjadi rute cepat untuk kondisi cemas, marah, capek, atau ingin fokus.",
  },
  {
    route: ROUTES.DASHBOARD,
    target: "user-reward",
    eyebrow: "Reward",
    title: "Selesaikan quest hari ini",
    description: "Quest, EXP, dan reward menjaga perjalanan terasa selesai, bukan hanya sekadar membuka fitur.",
  },
  {
    route: ROUTES.DASHBOARD,
    target: "user-progress-map",
    eyebrow: "Progress",
    title: "Lihat progres perjalanan",
    description: "Progress map menunjukkan capaian lintas aktivitas dan menjadi bagian dari narasi perjalanan tenang.",
  },
  {
    route: ROUTES.DASHBOARD,
    target: "user-wellness-plan",
    eyebrow: "Plan",
    title: "Ikuti rencana 7 hari",
    description: "Plan ini mengurutkan mood, breathing, jurnal, chat AI, reward, dan progress map agar flow user baru lebih jelas.",
  },
  {
    route: ROUTES.DASHBOARD,
    target: "user-need-now",
    eyebrow: "Butuh Apa",
    title: "Pilih kondisi saat ini",
    description: "Satu pintu masuk untuk langsung diarahkan ke kombinasi fitur yang paling relevan.",
  },
  {
    route: ROUTES.DASHBOARD,
    target: "user-weekly-insight",
    eyebrow: "Insight",
    title: "Baca laporan mingguan",
    description: "Ringkasan ini menggabungkan mood, jurnal, breathing, chat, dan quest menjadi pola serta rekomendasi minggu depan.",
  },
  {
    route: ROUTES.DASHBOARD,
    target: "user-journey-map",
    eyebrow: "Signature",
    title: "Peta Perjalanan Tenang",
    description: "Fitur khas Ruang Tenang yang merangkai streak, mood, jurnal, breathing, dan reward sebagai perjalanan personal.",
  },
  {
    route: ROUTES.DASHBOARD,
    target: "user-crisis-support",
    eyebrow: "Support",
    title: "Bantuan cepat selalu terlihat",
    description: "Saat situasi terasa tidak aman, tombol bantuan cepat tersedia tanpa harus masuk ke chat terlebih dahulu.",
  },
];

const TARGET_PADDING = 10;

function getSelector(target: string) {
  return `[data-user-tour="${target}"]`;
}

function getTargetRect(element: HTMLElement): TargetRect {
  const rect = element.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const left = Math.max(8, rect.left - TARGET_PADDING);
  const top = Math.max(8, rect.top - TARGET_PADDING);
  const width = Math.min(viewportWidth - left - 8, rect.width + TARGET_PADDING * 2);
  const height = Math.min(viewportHeight - top - 8, rect.height + TARGET_PADDING * 2);

  return { top, left, width, height };
}

export function UserFeatureTour() {
  const router = useRouter();
  const pathname = usePathname();
  const { token } = useAuthStore();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isSeekingTarget, setIsSeekingTarget] = useState(false);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const [shouldAutoStart, setShouldAutoStart] = useState(false);
  const [isWellnessOnboardingOpen, setIsWellnessOnboardingOpen] = useState(false);
  const targetElementRef = useRef<HTMLElement | null>(null);

  const activeStep = activeIndex === null ? null : TOUR_STEPS[activeIndex];
  const currentIndex = activeIndex ?? 0;
  const progressLabel = activeIndex === null ? "" : `${currentIndex + 1}/${TOUR_STEPS.length}`;
  const isLastStep = activeIndex === TOUR_STEPS.length - 1;

  const markTourComplete = useCallback(async () => {
    if (!token) return;

    try {
      await wellnessService.completeTour(token);
    } catch (error) {
      console.error("Failed to complete user feature tour:", error);
    }
  }, [token]);

  const closeTour = useCallback((complete = false) => {
    setActiveIndex(null);
    setTargetRect(null);
    setIsSeekingTarget(false);
    targetElementRef.current = null;

    if (complete) {
      void markTourComplete();
      setShouldAutoStart(false);
    }
  }, [markTourComplete]);

  const startTour = useCallback(() => {
    setActiveIndex(0);
    setTargetRect(null);
    setIsSeekingTarget(true);

    if (pathname !== TOUR_STEPS[0].route) {
      router.push(TOUR_STEPS[0].route);
    }
  }, [pathname, router]);

  const goToStep = useCallback((index: number) => {
    const boundedIndex = Math.max(0, Math.min(index, TOUR_STEPS.length - 1));
    setActiveIndex(boundedIndex);
    setTargetRect(null);
    setIsSeekingTarget(true);

    const nextStep = TOUR_STEPS[boundedIndex];
    if (pathname !== nextStep.route) {
      router.push(nextStep.route);
    }
  }, [pathname, router]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const loadTourState = async () => {
      try {
        const response = await wellnessService.getOnboarding(token);
        if (cancelled) return;

        const profile = response.data?.profile;
        setShouldAutoStart(Boolean(profile && !profile.tour_completed_at && !response.data?.needs_onboarding));
      } catch (error) {
        console.error("Failed to load user tour status:", error);
      }
    };

    loadTourState();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    const handleWellnessOnboardingState = (event: Event) => {
      const detail = (event as CustomEvent<{ isOpen?: boolean }>).detail;
      setIsWellnessOnboardingOpen(Boolean(detail?.isOpen));
    };

    window.addEventListener("wellness-onboarding-state", handleWellnessOnboardingState);
    return () => window.removeEventListener("wellness-onboarding-state", handleWellnessOnboardingState);
  }, []);

  useEffect(() => {
    if (!shouldAutoStart || hasAutoStarted || isWellnessOnboardingOpen || activeIndex !== null) return;

    setHasAutoStarted(true);
    const timeoutId = window.setTimeout(startTour, 450);
    return () => window.clearTimeout(timeoutId);
  }, [activeIndex, hasAutoStarted, isWellnessOnboardingOpen, shouldAutoStart, startTour]);

  useEffect(() => {
    if (!activeStep) return;

    if (pathname !== activeStep.route) {
      setIsSeekingTarget(true);
      targetElementRef.current = null;
      router.push(activeStep.route);
      return;
    }

    let cancelled = false;
    let timeoutId: number | undefined;
    let attempts = 0;

    const updateTarget = () => {
      if (cancelled) return;

      const element = document.querySelector<HTMLElement>(getSelector(activeStep.target));
      if (!element) {
        attempts += 1;

        if (attempts <= 20) {
          timeoutId = window.setTimeout(updateTarget, 120);
          return;
        }

        targetElementRef.current = null;
        setTargetRect(null);
        setIsSeekingTarget(false);
        return;
      }

      targetElementRef.current = element;
      element.scrollIntoView({
        block: "center",
        inline: "nearest",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });

      window.setTimeout(() => {
        if (cancelled || targetElementRef.current !== element) return;
        setTargetRect(getTargetRect(element));
        setIsSeekingTarget(false);
      }, 260);
    };

    setIsSeekingTarget(true);
    updateTarget();

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [activeStep, pathname, router]);

  useEffect(() => {
    if (!activeStep || activeIndex === null) return;

    const handleUpdate = () => {
      const element = targetElementRef.current ?? document.querySelector<HTMLElement>(getSelector(activeStep.target));
      if (!element) return;
      targetElementRef.current = element;
      setTargetRect(getTargetRect(element));
    };

    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [activeIndex, activeStep]);

  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeTour(false);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (isLastStep) closeTour(true);
        else goToStep(activeIndex + 1);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToStep(activeIndex - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, closeTour, goToStep, isLastStep]);

  const highlightStyle = useMemo(() => {
    if (!targetRect) return undefined;

    return {
      top: targetRect.top,
      left: targetRect.left,
      width: targetRect.width,
      height: targetRect.height,
    };
  }, [targetRect]);

  return (
    <>
      <Button
        type="button"
        onClick={startTour}
        className="fixed bottom-3 left-3 z-30 rounded-full bg-emerald-600 px-3 shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 xs:bottom-4 xs:left-4 xs:px-4"
        aria-label="Mulai tour fitur dashboard user"
      >
        <Compass className="h-4 w-4" />
        <span className="hidden xs:inline">Tour User</span>
      </Button>

      {activeStep && (
        <div className="pointer-events-none fixed inset-0 z-[80]">
          {targetRect ? (
            <div
              className="fixed rounded-2xl border-2 border-emerald-400 bg-transparent shadow-[0_0_0_9999px_rgba(15,23,42,0.58)] transition-all duration-200"
              style={highlightStyle}
            />
          ) : (
            <div className="fixed inset-0 bg-slate-950/60" />
          )}

          <section
            className={cn(
              "pointer-events-auto fixed bottom-4 left-3 right-3 z-[90] rounded-2xl border border-emerald-100 bg-white p-4 shadow-2xl shadow-slate-950/20",
              "xs:left-auto xs:right-4 xs:w-[min(24rem,calc(100vw-2rem))]"
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Tour fitur dashboard user"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">{activeStep.eyebrow}</p>
                <h2 className="mt-1 text-base font-semibold text-gray-950">{activeStep.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => closeTour(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                aria-label="Tutup tour"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-sm leading-6 text-gray-600">{activeStep.description}</p>

            {isSeekingTarget && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Menyiapkan sorotan
              </div>
            )}

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${((currentIndex + 1) / TOUR_STEPS.length) * 100}%` }}
              />
            </div>

            <div className="mt-4 flex flex-col gap-2 xs:flex-row xs:items-center xs:justify-between">
              <span className="text-xs font-semibold text-gray-500">{progressLabel}</span>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => goToStep(currentIndex - 1)} disabled={currentIndex === 0}>
                  <ChevronLeft className="h-4 w-4" />
                  Kembali
                </Button>
                <Button type="button" size="sm" onClick={() => (isLastStep ? closeTour(true) : goToStep(currentIndex + 1))}>
                  {isLastStep ? "Selesai" : "Lanjut"}
                  {!isLastStep && <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
