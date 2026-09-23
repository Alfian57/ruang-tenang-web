"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { moodService } from "@/services/api";
import { MoodType } from "@/types";
import { ApiError } from "@/services/http/types";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { MoodCheckinModal } from "@/app/dashboard/_components/MoodCheckinModal";
import { useDashboardStore } from "@/store/dashboardStore";
import { useDailyTaskStore } from "@/store/dailyTaskStore";

export function MoodCheckinProvider() {
  const { token, refreshUser } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [isWellnessOnboardingOpen, setIsWellnessOnboardingOpen] = useState(false);
  const { triggerMoodRefresh } = useDashboardStore();
  const loadDailyTasks = useDailyTaskStore((state) => state.loadTasks);

  const checkTodayMood = useCallback(async () => {
    if (!token || hasChecked || isWellnessOnboardingOpen) return;

    try {
      const response = await moodService.checkToday(token);
      const data = response.data;

      if (data && !data.has_checked) {
        setShowModal(true);
      }
    } catch (error) {
      const errMsg = error instanceof ApiError || error instanceof Error ? error.message : "Unknown error";
      toast.error(`Gagal memuat status mood: ${errMsg}`);
    } finally {
      setHasChecked(true);
    }
  }, [token, hasChecked, isWellnessOnboardingOpen]);

  useEffect(() => {
    checkTodayMood();
  }, [checkTodayMood]);

  useEffect(() => {
    const handleWellnessOnboardingState = (event: Event) => {
      const detail = (event as CustomEvent<{ isOpen?: boolean }>).detail;
      const isOpen = Boolean(detail?.isOpen);
      setIsWellnessOnboardingOpen(isOpen);

      if (isOpen) {
        setShowModal(false);
        return;
      }

      setHasChecked(false);
    };

    window.addEventListener("wellness-onboarding-state", handleWellnessOnboardingState);
    return () => window.removeEventListener("wellness-onboarding-state", handleWellnessOnboardingState);
  }, []);

  const handleMoodSelected = async (mood: MoodType) => {
    if (!token || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await moodService.record(token, mood);
      if (response.data) {
        toast.success("Mood berhasil dicatat!", {
          description: (
            <span className="inline-flex items-center gap-1.5">
              Semoga harimu menyenangkan
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            </span>
          ),
        });
        setShowModal(false);
        triggerMoodRefresh();
        void loadDailyTasks(token, true);
        refreshUser(); // Refresh user data to update EXP in navbar
      } else {
        toast.error("Gagal mencatat mood");
      }
    } catch {
      toast.error("Gagal mencatat mood");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MoodCheckinModal
      isOpen={showModal}
      onMoodSelected={handleMoodSelected}
      isSubmitting={isSubmitting}
    />
  );
}
