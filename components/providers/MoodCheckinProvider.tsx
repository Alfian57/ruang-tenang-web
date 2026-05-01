"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { moodService } from "@/services/api";
import { MoodType } from "@/types";
import { ApiError } from "@/services/http/types";
import { toast } from "sonner";
import { MoodCheckinModal } from "@/app/dashboard/_components/MoodCheckinModal";
import { useDashboardStore } from "@/store/dashboardStore";

export function MoodCheckinProvider() {
  const { token, refreshUser } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const { triggerMoodRefresh, triggerTaskRefresh } = useDashboardStore();

  const checkTodayMood = useCallback(async () => {
    if (!token || hasChecked) return;

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
  }, [token, hasChecked]);

  useEffect(() => {
    checkTodayMood();
  }, [checkTodayMood]);

  const handleMoodSelected = async (mood: MoodType) => {
    if (!token || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await moodService.record(token, mood);
      if (response.data) {
        toast.success("Mood berhasil dicatat!", {
          description: "Semoga harimu menyenangkan 😊",
        });
        setShowModal(false);
        triggerMoodRefresh();
        triggerTaskRefresh();
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
