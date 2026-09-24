"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { moodService } from "@/services/api";
import { MoodType } from "@/types";
import { ApiError } from "@/services/http/types";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { MoodCheckinModal } from "@/app/dashboard/_components/MoodCheckinModal";
import { useDashboardStore } from "@/store/dashboardStore";
import { useDailyTaskStore } from "@/store/dailyTaskStore";

export function MoodCheckinProvider() {
  const { token, refreshUser } = useAuthStore();
  const currentTokenRef = useRef(token);
  currentTokenRef.current = token;
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [isWellnessOnboardingOpen, setIsWellnessOnboardingOpen] = useState(false);
  const triggerMoodRefresh = useDashboardStore((state) => state.triggerMoodRefresh);
  const setMoodCheckinStatus = useDashboardStore((state) => state.setMoodCheckinStatus);
  const loadDailyTasks = useDailyTaskStore((state) => state.loadTasks);

  const checkTodayMood = useCallback(async () => {
    if (!token || hasChecked || isWellnessOnboardingOpen) return;

    setMoodCheckinStatus('checking');
    try {
      const response = await moodService.checkToday(token);
      if (currentTokenRef.current !== token) return;
      const data = response.data;

      if (data && !data.has_checked) {
        setShowModal(true);
        setMoodCheckinStatus('open');
      } else {
        setMoodCheckinStatus('ready');
      }
    } catch (error) {
      if (currentTokenRef.current !== token) return;
      const errMsg = error instanceof ApiError || error instanceof Error ? error.message : "Unknown error";
      toast.error(`Gagal memuat status mood: ${errMsg}`);
      setMoodCheckinStatus('ready');
    } finally {
      if (currentTokenRef.current === token) setHasChecked(true);
    }
  }, [token, hasChecked, isWellnessOnboardingOpen, setMoodCheckinStatus]);

  useEffect(() => {
    setHasChecked(false);
    setShowModal(false);
    setMoodCheckinStatus('checking');
  }, [token, setMoodCheckinStatus]);

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
        setMoodCheckinStatus('checking');
        return;
      }

      setHasChecked(false);
    };

    window.addEventListener("wellness-onboarding-state", handleWellnessOnboardingState);
    return () => window.removeEventListener("wellness-onboarding-state", handleWellnessOnboardingState);
  }, [setMoodCheckinStatus]);

  const handleMoodSelected = async (mood: MoodType) => {
    if (!token || isSubmitting) return;
    setSelectedMood(mood);
    setIsSubmitting(true);

    try {
      const response = await moodService.record(token, mood);
      if (response.data) {
        toast.success("Mood berhasil dicatat!", {
          description: (
            <span className="inline-flex items-center gap-1.5">
              Semoga harimu menyenangkan
              <Heart className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            </span>
          ),
        });
        setShowModal(false);
        setMoodCheckinStatus('ready');
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
      setSelectedMood(null);
    }
  };

  return (
    <MoodCheckinModal
      isOpen={showModal}
      onMoodSelected={handleMoodSelected}
      isSubmitting={isSubmitting}
      selectedMood={selectedMood}
    />
  );
}
