"use client";

import Image from "next/image";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Compass, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { wellnessService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useDashboardStore } from "@/store/dashboardStore";

type TourMascot = "guide" | "mood" | "support" | "chat" | "journal" | "articles" | "music" | "community" | "journey" | "missions";

type TourStep = {
  route: string;
  target: string;
  fallback?: string;
  eyebrow: string;
  title: string;
  description: string;
  mascot: TourMascot;
};

type TargetRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const TOUR_STEPS: readonly TourStep[] = [
  {
    route: ROUTES.DASHBOARD,
    target: "user-welcome",
    eyebrow: "Selamat datang",
    title: "Halo, aku RuNa!",
    description: "Aku akan menemanimu mengenal ruang ini. Kita mulai dari Beranda, tempat langkah kecilmu setiap hari berkumpul.",
    mascot: "guide",
  },
  {
    route: ROUTES.DASHBOARD,
    target: "user-mood",
    eyebrow: "Beranda",
    title: "Kenali suasana hatimu",
    description: "Di sini kamu bisa melihat pola mood dan mengenali apa yang kamu rasakan dari waktu ke waktu.",
    mascot: "mood",
  },
  {
    route: ROUTES.DASHBOARD,
    target: "user-crisis-support",
    eyebrow: "Dukungan",
    title: "Bantuan selalu dekat",
    description: "Kalau kamu sedang merasa tidak aman, bantuan cepat tersedia di sini. Kamu tidak perlu menghadapinya sendirian.",
    mascot: "support",
  },
  {
    route: ROUTES.CHAT,
    target: "chat-composer",
    eyebrow: "Teman Cerita AI",
    title: "Ceritakan dengan caramu",
    description: "Ketik pesan atau gunakan suara untuk mulai bercerita. Sebelum pertama kali mengobrol, baca persetujuan penggunaan AI yang muncul.",
    mascot: "chat",
  },
  {
    route: ROUTES.JOURNAL,
    target: "journal-actions",
    fallback: "page-hero",
    eyebrow: "Jurnal",
    title: "Simpan refleksimu",
    description: "Tulis hal yang ingin kamu pahami, lalu lihat kembali catatan dan analitik pribadimu kapan saja.",
    mascot: "journal",
  },
  {
    route: ROUTES.ARTICLES,
    target: "articles-discover",
    fallback: "page-hero",
    eyebrow: "Artikel",
    title: "Temukan bacaan yang pas",
    description: "Cari topik yang dekat dengan keadaanmu. Kamu juga bisa menulis artikelmu sendiri dari tab Artikel Saya.",
    mascot: "articles",
  },
  {
    route: ROUTES.MUSIC,
    target: "music-tabs",
    fallback: "page-hero",
    eyebrow: "Musik",
    title: "Pilih irama pendamping",
    description: "Jelajahi musik relaksasi, temukan playlist, atau susun daftar putarmu sendiri.",
    mascot: "music",
  },
  {
    route: ROUTES.COMMUNITY,
    target: "community-actions",
    fallback: "page-hero",
    eyebrow: "Komunitas",
    title: "Terhubung dengan sesama",
    description: "Ikuti percakapan yang suportif, baca kisah inspiratif, atau bagikan topik saat kamu siap.",
    mascot: "community",
  },
  {
    route: ROUTES.JOURNEY,
    target: "journey-tabs",
    fallback: "page-hero",
    eyebrow: "Perjalanan",
    title: "Lihat langkah yang sudah kamu tempuh",
    description: "Di sini ada ringkasan, peta checkpoint, dan hadiah untuk merayakan kemajuanmu.",
    mascot: "journey",
  },
  {
    route: ROUTES.JOURNEY,
    target: "daily-missions",
    eyebrow: "Misi harian",
    title: "Satu langkah kecil lagi",
    description: "Buka tombol ini untuk melihat misi harian dan mengambil hadiah dari aktivitas yang telah kamu selesaikan. Sampai jumpa di perjalananmu!",
    mascot: "missions",
  },
];

const TARGET_PADDING = 8;
const CALLOUT_GAP = 16;
const preloadedMascotImages = new Map<TourMascot, HTMLImageElement>();

function preloadMascotImage(mascot: TourMascot) {
  if (preloadedMascotImages.has(mascot)) return;

  const image = new window.Image();
  image.decoding = "async";
  image.src = `/images/dashboard/mascot/tour-${mascot}.webp`;
  preloadedMascotImages.set(mascot, image);
}

function getTargetElement(target: string): HTMLElement | null {
  const element = document.querySelector<HTMLElement>(`[data-user-tour="${target}"]`);
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 ? element : null;
}

function getTargetRect(element: HTMLElement): TargetRect {
  const rect = element.getBoundingClientRect();
  const left = Math.max(8, rect.left - TARGET_PADDING);
  const top = Math.max(8, rect.top - TARGET_PADDING);

  return {
    top,
    left,
    width: Math.max(0, Math.min(window.innerWidth - left - 8, rect.width + TARGET_PADDING * 2)),
    height: Math.max(0, Math.min(window.innerHeight - top - 8, rect.height + TARGET_PADDING * 2)),
  };
}

function getCalloutPosition(target: TargetRect | null, height: number) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const width = Math.min(392, viewportWidth - 24);
  const clampLeft = (left: number) => Math.max(12, Math.min(viewportWidth - width - 12, left));
  const clampTop = (top: number) => Math.max(12, Math.min(viewportHeight - height - 12, top));
  const centeredLeft = target
    ? clampLeft(target.left + target.width / 2 - width / 2)
    : clampLeft((viewportWidth - width) / 2);

  if (viewportWidth < 760) {
    if (!target) {
      return { width, left: centeredLeft, top: clampTop((viewportHeight - height) / 2) };
    }

    const candidateTops = [...new Set([12, Math.max(12, viewportHeight - height - 12)])];
    const targetCenterY = target.top + target.height / 2;
    const top = candidateTops.reduce((best, candidate) => {
      const candidateRect = { left: centeredLeft, top: candidate, width, height };
      const bestRect = { left: centeredLeft, top: best, width, height };
      const candidateOverlaps = overlaps(candidateRect, target, TARGET_PADDING);
      const bestOverlaps = overlaps(bestRect, target, TARGET_PADDING);

      if (candidateOverlaps !== bestOverlaps) return candidateOverlaps ? best : candidate;

      const candidateDistance = Math.abs(candidate + height / 2 - targetCenterY);
      const bestDistance = Math.abs(best + height / 2 - targetCenterY);
      return candidateDistance > bestDistance ? candidate : best;
    }, candidateTops[0]);

    return { width, left: centeredLeft, top };
  }

  if (!target) {
    return { width, left: centeredLeft, top: clampTop((viewportHeight - height) / 2) };
  }

  const targetBottom = target.top + target.height;

  if (targetBottom + CALLOUT_GAP + height < viewportHeight - 12) {
    return { width, left: centeredLeft, top: targetBottom + CALLOUT_GAP };
  }
  if (target.top - CALLOUT_GAP - height > 12) {
    return { width, left: centeredLeft, top: target.top - CALLOUT_GAP - height };
  }
  if (target.left - CALLOUT_GAP - width > 12) {
    return { width, left: target.left - CALLOUT_GAP - width, top: clampTop(target.top) };
  }
  if (target.left + target.width + CALLOUT_GAP + width < viewportWidth - 12) {
    return { width, left: target.left + target.width + CALLOUT_GAP, top: clampTop(target.top) };
  }

  return { width, left: centeredLeft, top: clampTop(target.top > viewportHeight / 2 ? 12 : viewportHeight - height - 12) };
}

type PlacedRect = { left: number; top: number; width: number; height: number };

function overlaps(a: PlacedRect, b: PlacedRect, gap = 18) {
  return a.left < b.left + b.width + gap
    && a.left + a.width + gap > b.left
    && a.top < b.top + b.height + gap
    && a.top + a.height + gap > b.top;
}

function getCompanionPosition(target: TargetRect | null, callout: PlacedRect | undefined): PlacedRect | null {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  if (viewportWidth < 760) return null;

  const height = Math.min(820, viewportHeight * 0.82, viewportWidth * 0.46);
  const width = height * 2 / 3;
  const margin = 16;
  const rightInset = Math.min(300, viewportWidth * 0.16);
  const lefts = [...new Set([margin, viewportWidth - width - margin - rightInset])];
  const targetCenterY = target ? target.top + target.height / 2 : viewportHeight / 2;
  const preferredRight = !target || target.left + target.width / 2 < viewportWidth / 2;
  const preferredLeft = preferredRight ? lefts[1] : lefts[0];
  const alternateLeft = preferredRight ? lefts[0] : lefts[1];
  const tops = [
    targetCenterY - height / 2,
    viewportHeight / 2 - height / 2,
    margin,
    viewportHeight - height - margin,
    callout ? callout.top - height - margin : 0,
    callout ? callout.top + callout.height + margin : viewportHeight - height - margin,
  ].map((top) => Math.max(margin, Math.min(viewportHeight - height - margin, top)));
  const candidates = [preferredLeft, alternateLeft]
    .flatMap((left) => tops.map((top) => ({ left, top, width, height })))
    .filter((candidate) => candidate.left >= margin && candidate.left + width <= viewportWidth - margin);
  const clearCandidates = candidates.filter((candidate) =>
    (!target || !overlaps(candidate, target, 26)) && (!callout || !overlaps(candidate, callout, 18))
  );

  if (clearCandidates.length > 0) return clearCandidates[0];

  return candidates.reduce((best, candidate) => {
    const score = (target && overlaps(candidate, target, 0) ? 1000 : 0)
      + (callout && overlaps(candidate, callout, 0) ? 100 : 0)
      + Math.abs(candidate.top + candidate.height / 2 - targetCenterY) / viewportHeight;
    const bestScore = (target && overlaps(best, target, 0) ? 1000 : 0)
      + (callout && overlaps(best, callout, 0) ? 100 : 0)
      + Math.abs(best.top + best.height / 2 - targetCenterY) / viewportHeight;
    return score < bestScore ? candidate : best;
  }, candidates[0] ?? { left: margin, top: margin, width: 0, height: 0 });
}

export function UserFeatureTour() {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);
  const moodCheckinStatus = useDashboardStore((state) => state.moodCheckinStatus);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isSeekingTarget, setIsSeekingTarget] = useState(false);
  const [showTargetSearchStatus, setShowTargetSearchStatus] = useState(false);
  const [tourEligibility, setTourEligibility] = useState<"checking" | "eligible" | "complete">("checking");
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const [isWellnessOnboardingOpen, setIsWellnessOnboardingOpen] = useState(false);
  const [isChatDisclaimerBlocking, setIsChatDisclaimerBlocking] = useState(false);
  const [calloutHeight, setCalloutHeight] = useState(220);
  const targetElementRef = useRef<HTMLElement | null>(null);
  const requestedRouteRef = useRef<string | null>(null);
  const calloutRef = useRef<HTMLDivElement | null>(null);

  const activeStep = activeIndex === null ? null : TOUR_STEPS[activeIndex];
  const isLastStep = activeIndex === TOUR_STEPS.length - 1;

  const markTourComplete = useCallback(async () => {
    if (!token) return;
    try {
      await wellnessService.completeTour(token);
    } catch (error) {
      console.error("Failed to save user feature tour completion:", error);
      toast.error("Status tur belum tersimpan. Kamu bisa mencobanya lagi nanti.");
    }
  }, [token]);

  const closeTour = useCallback((complete: boolean) => {
    setActiveIndex(null);
    setTargetRect(null);
    setIsSeekingTarget(false);
    targetElementRef.current = null;
    requestedRouteRef.current = null;
    if (complete) {
      setTourEligibility("complete");
      setHasAutoStarted(true);
      void markTourComplete();
    }
  }, [markTourComplete]);

  const finishTour = useCallback(() => {
    closeTour(true);
    router.replace(ROUTES.DASHBOARD);
  }, [closeTour, router]);

  const startTour = useCallback(() => {
    setHasAutoStarted(true);
    setActiveIndex(0);
    setTargetRect(null);
    setIsSeekingTarget(true);
    targetElementRef.current = null;
    if (pathname !== TOUR_STEPS[0].route) {
      requestedRouteRef.current = TOUR_STEPS[0].route;
      router.replace(TOUR_STEPS[0].route);
    }
  }, [pathname, router]);

  const goToStep = useCallback((index: number) => {
    const boundedIndex = Math.max(0, Math.min(index, TOUR_STEPS.length - 1));
    const nextStep = TOUR_STEPS[boundedIndex];
    setActiveIndex(boundedIndex);
    setTargetRect(null);
    setIsSeekingTarget(true);
    targetElementRef.current = null;
    setIsChatDisclaimerBlocking(nextStep.route === ROUTES.CHAT);
    if (pathname !== nextStep.route) {
      requestedRouteRef.current = nextStep.route;
      router.replace(nextStep.route);
    }
  }, [pathname, router]);

  useEffect(() => {
    setActiveIndex(null);
    setTargetRect(null);
    setTourEligibility("checking");
    setHasAutoStarted(false);
    if (!token) return;

    let cancelled = false;
    wellnessService.getOnboarding(token)
      .then((response) => {
        if (cancelled) return;
        setTourEligibility(response.data?.profile?.tour_completed_at ? "complete" : "eligible");
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load user tour status:", error);
        setTourEligibility("complete");
      });

    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    const handleWellnessState = (event: Event) => {
      const detail = (event as CustomEvent<{ isOpen?: boolean }>).detail;
      setIsWellnessOnboardingOpen(Boolean(detail?.isOpen));
    };
    window.addEventListener("wellness-onboarding-state", handleWellnessState);
    return () => window.removeEventListener("wellness-onboarding-state", handleWellnessState);
  }, []);

  useEffect(() => {
    if (tourEligibility !== "eligible" || hasAutoStarted || activeIndex !== null || moodCheckinStatus !== "ready" || isWellnessOnboardingOpen) return;
    const timeoutId = window.setTimeout(startTour, 350);
    return () => window.clearTimeout(timeoutId);
  }, [tourEligibility, hasAutoStarted, activeIndex, moodCheckinStatus, isWellnessOnboardingOpen, startTour]);

  useEffect(() => {
    if (tourEligibility === "eligible" && window.innerWidth >= 760) {
      preloadMascotImage(TOUR_STEPS[0].mascot);
    }
  }, [tourEligibility]);

  useEffect(() => {
    if (!activeStep) return;
    if (pathname === activeStep.route) {
      requestedRouteRef.current = null;
      return;
    }
    if (requestedRouteRef.current !== activeStep.route) closeTour(false);
  }, [activeStep, pathname, closeTour]);

  useEffect(() => {
    if (!activeStep || pathname === activeStep.route || requestedRouteRef.current !== activeStep.route) return;
    const timeoutId = window.setTimeout(() => {
      if (requestedRouteRef.current !== activeStep.route) return;
      toast.error("Halaman tur belum berhasil dibuka. Kamu bisa mencoba lagi nanti.");
      closeTour(false);
    }, 10000);
    return () => window.clearTimeout(timeoutId);
  }, [activeStep, pathname, closeTour]);

  useEffect(() => {
    if (!activeStep || activeStep.route !== ROUTES.CHAT || pathname !== ROUTES.CHAT) {
      setIsChatDisclaimerBlocking(false);
      return;
    }

    let canRelease = false;
    const syncBlocker = () => {
      const disclaimerOpen = Boolean(document.querySelector('[data-tour-blocker="chat-disclaimer"]'));
      setIsChatDisclaimerBlocking(disclaimerOpen || !canRelease);
    };
    const observer = new MutationObserver(syncBlocker);
    observer.observe(document.body, { childList: true, subtree: true });
    syncBlocker();
    const releaseId = window.setTimeout(() => {
      canRelease = true;
      syncBlocker();
    }, 450);

    return () => {
      window.clearTimeout(releaseId);
      observer.disconnect();
    };
  }, [activeStep, pathname]);

  useEffect(() => {
    if (!activeStep || activeIndex === null || pathname !== activeStep.route) return;

    targetElementRef.current = null;
    setTargetRect(null);
    setIsSeekingTarget(true);
    let allowFallback = false;
    let animationFrameId: number | undefined;
    let targetPollId: number | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let restoreScrollMargin: (() => void) | undefined;
    const scheduleTargetMeasurement = (onMeasured?: () => void) => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(() => {
        const target = targetElementRef.current;
        if (target?.isConnected) {
          setTargetRect(getTargetRect(target));
          onMeasured?.();
          return;
        }

        targetElementRef.current = null;
        tryFindTarget();
      });
    };
    const updateTargetRect = () => scheduleTargetMeasurement();
    const observer = new MutationObserver(() => {
      if (!targetElementRef.current?.isConnected) tryFindTarget();
    });

    function focusTarget(element: HTMLElement) {
      if (targetElementRef.current && targetElementRef.current !== element) {
        resizeObserver?.disconnect();
        restoreScrollMargin?.();
        restoreScrollMargin = undefined;
      }
      targetElementRef.current = element;
      if (targetPollId) window.clearInterval(targetPollId);
      const shouldAlignTop = window.innerWidth < 640 && activeStep!.target !== "chat-composer" && activeStep!.target !== "daily-missions";
      if (shouldAlignTop) {
        const previousMargin = element.style.scrollMarginTop;
        element.style.scrollMarginTop = "82px";
        restoreScrollMargin = () => { element.style.scrollMarginTop = previousMargin; };
      }
      element.scrollIntoView({
        block: shouldAlignTop ? "start" : "center",
        inline: "nearest",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
      scheduleTargetMeasurement(() => setIsSeekingTarget(false));
      resizeObserver = new ResizeObserver(updateTargetRect);
      resizeObserver.observe(element);
    }

    function tryFindTarget() {
      if (targetElementRef.current?.isConnected) return;
      targetElementRef.current = null;
      const element = getTargetElement(activeStep!.target)
        ?? (allowFallback && activeStep!.fallback ? getTargetElement(activeStep!.fallback) : null);
      if (element) focusTarget(element);
    }

    observer.observe(document.body, { childList: true, subtree: true });
    tryFindTarget();
    if (!targetElementRef.current) targetPollId = window.setInterval(tryFindTarget, 120);
    const fallbackId = window.setTimeout(() => {
      allowFallback = true;
      tryFindTarget();
    }, 1800);
    const giveUpId = window.setTimeout(() => {
      if (targetElementRef.current) return;
      if (activeIndex === TOUR_STEPS.length - 1) closeTour(true);
      else goToStep(activeIndex + 1);
    }, 4800);
    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect, { capture: true, passive: true });

    return () => {
      observer.disconnect();
      resizeObserver?.disconnect();
      restoreScrollMargin?.();
      if (targetPollId) window.clearInterval(targetPollId);
      window.clearTimeout(fallbackId);
      window.clearTimeout(giveUpId);
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect, true);
    };
  }, [activeStep, activeIndex, pathname, closeTour, goToStep]);

  useEffect(() => {
    if (!isSeekingTarget) {
      setShowTargetSearchStatus(false);
      return;
    }

    setShowTargetSearchStatus(false);
    const timeoutId = window.setTimeout(() => setShowTargetSearchStatus(true), 500);
    return () => window.clearTimeout(timeoutId);
  }, [isSeekingTarget, activeIndex]);

  useEffect(() => {
    if (!activeStep || activeIndex === null || typeof window === "undefined" || window.innerWidth < 760) return;

    const nextStep = TOUR_STEPS[activeIndex + 1];
    if (nextStep) preloadMascotImage(nextStep.mascot);
  }, [activeIndex, activeStep]);

  useEffect(() => {
    if (activeIndex === null || !calloutRef.current) return;
    const observer = new ResizeObserver(([entry]) => setCalloutHeight(entry.target.getBoundingClientRect().height));
    observer.observe(calloutRef.current);
    return () => observer.disconnect();
  }, [activeIndex, isChatDisclaimerBlocking, isWellnessOnboardingOpen, moodCheckinStatus]);

  useEffect(() => {
    if (activeIndex === null || isChatDisclaimerBlocking || isWellnessOnboardingOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (isLastStep) finishTour();
        else goToStep(activeIndex + 1);
      }
      if (event.key === "ArrowLeft" && activeIndex > 0) {
        event.preventDefault();
        goToStep(activeIndex - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, isChatDisclaimerBlocking, isLastStep, isWellnessOnboardingOpen, finishTour, goToStep]);

  const calloutPosition = useMemo(
    () => activeStep ? getCalloutPosition(targetRect, calloutHeight) : undefined,
    [activeStep, targetRect, calloutHeight],
  );
  const companionPosition = useMemo(
    () => activeStep
      ? getCompanionPosition(targetRect, calloutPosition ? { ...calloutPosition, height: calloutHeight } : undefined)
      : undefined,
    [activeStep, targetRect, calloutPosition, calloutHeight],
  );
  const shouldMirrorCompanion = Boolean(
    targetRect
    && companionPosition
    && companionPosition.left + companionPosition.width / 2 < targetRect.left + targetRect.width / 2,
  );
  const showDialog = Boolean(activeStep && !isChatDisclaimerBlocking && !isWellnessOnboardingOpen && moodCheckinStatus === "ready");

  return (
    <>
      {activeIndex === null && (
        <Button
          type="button"
          onClick={startTour}
          className="fixed bottom-3 left-3 z-30 rounded-full bg-primary px-3 shadow-lg shadow-emerald-900/20 hover:bg-primary xs:bottom-4 xs:left-4 xs:px-4"
          aria-label="Mulai tur RuNa"
        >
          <Compass className="h-4 w-4" />
          <span className="hidden xs:inline">Tur RuNa</span>
        </Button>
      )}

      <DialogPrimitive.Root open={showDialog}>
        {showDialog && activeStep && (
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-transparent" />
            {targetRect ? (
              <div
                aria-hidden="true"
                className="pointer-events-none fixed z-[101] rounded-[1.35rem] border-2 border-white/95 shadow-[0_0_0_9999px_rgba(15,23,42,0.68),0_0_0_5px_rgba(251,191,177,0.72)] transition-[top,left,width,height] duration-200"
                style={targetRect}
              />
            ) : (
              <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[101] bg-slate-950/65" />
            )}
            {companionPosition && (
              <div
                aria-hidden="true"
                className="pointer-events-none fixed z-[102] drop-shadow-[0_22px_36px_rgba(8,15,38,0.34)] transition-[top,left,width,height,transform] duration-300"
                style={{ ...companionPosition, transform: shouldMirrorCompanion ? "scaleX(-1)" : undefined }}
              >
                <Image
                  src={`/images/dashboard/mascot/tour-${activeStep.mascot}.webp`}
                  alt=""
                  width={480}
                  height={720}
                  sizes="(max-width: 900px) 300px, (max-width: 1280px) 400px, 480px"
                  className="h-full w-full object-contain"
                  unoptimized
                  priority
                  onLoad={() => {
                    const nextStep = TOUR_STEPS[activeIndex! + 1];
                    if (nextStep) preloadMascotImage(nextStep.mascot);
                  }}
                />
              </div>
            )}
            <DialogPrimitive.Content
              ref={calloutRef}
              aria-describedby="runa-tour-description"
              onEscapeKeyDown={(event) => { event.preventDefault(); closeTour(true); }}
              onInteractOutside={(event) => event.preventDefault()}
              className="fixed z-[102] max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-[1.6rem] border border-rose-100 bg-[#fffdfb] p-3 shadow-[0_24px_72px_rgba(15,23,42,0.28)] outline-none sm:p-5"
              style={calloutPosition}
            >
              <div className="flex min-w-0 flex-col justify-center pt-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-rose-600">RuNa · {activeStep.eyebrow}</p>
                <DialogPrimitive.Title className="mt-1 text-base font-bold leading-tight text-slate-900 sm:mt-1.5 sm:text-lg">{activeStep.title}</DialogPrimitive.Title>
              </div>
              <DialogPrimitive.Description id="runa-tour-description" className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
                {activeStep.description}
              </DialogPrimitive.Description>
              {isSeekingTarget && showTargetSearchStatus && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-rose-600" role="status">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Menyiapkan sorotan…
                </p>
              )}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-rose-100 sm:mt-4" aria-hidden="true">
                <div className="h-full rounded-full bg-rose-500 transition-[width] duration-200" style={{ width: `${((activeIndex! + 1) / TOUR_STEPS.length) * 100}%` }} />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 sm:mt-4">
                <span className="text-xs font-medium text-slate-500">Langkah {activeIndex! + 1} dari {TOUR_STEPS.length}</span>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => closeTour(true)} className="text-slate-500 hover:text-slate-900">Lewati</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => goToStep(activeIndex! - 1)} disabled={activeIndex === 0} className="rounded-xl">
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Kembali
                  </Button>
                  <Button type="button" size="sm" onClick={() => isLastStep ? finishTour() : goToStep(activeIndex! + 1)} className="rounded-xl">
                    {isLastStep ? "Selesai" : "Lanjut"}{!isLastStep && <ChevronRight className="h-4 w-4" aria-hidden="true" />}
                  </Button>
                </div>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </DialogPrimitive.Root>
    </>
  );
}
