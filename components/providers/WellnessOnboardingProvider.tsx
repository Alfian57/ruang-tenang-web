"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { wellnessService } from "@/services/api";
import { ApiError } from "@/services/http/types";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/utils";

const moodOptions = [
  { value: "cemas", label: "Cemas" },
  { value: "capek", label: "Capek" },
  { value: "sedih", label: "Sedih" },
  { value: "marah", label: "Marah" },
  { value: "bingung", label: "Bingung" },
  { value: "ingin fokus", label: "Ingin fokus" },
];

const goalOptions = [
  "Tidur lebih tenang",
  "Mengurangi cemas",
  "Bangun rutinitas refleksi",
  "Lebih fokus belajar/kerja",
  "Mengenali pola emosi",
  "Lebih konsisten self-care",
];

const habitOptions = [
  "Mood check-in pagi",
  "Jurnal singkat malam",
  "Breathing 3 menit",
  "Musik saat fokus",
  "Chat reflektif",
  "Cek reward harian",
];

function toggleSelection(items: string[], value: string) {
  return items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value];
}

function emitWellnessOnboardingState(isOpen: boolean) {
  window.dispatchEvent(new CustomEvent("wellness-onboarding-state", { detail: { isOpen } }));
}

export function WellnessOnboardingProvider() {
  const { token } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialMood, setInitialMood] = useState("cemas");
  const [goals, setGoals] = useState<string[]>(["Mengurangi cemas"]);
  const [habits, setHabits] = useState<string[]>(["Mood check-in pagi", "Jurnal singkat malam"]);

  const canSubmit = useMemo(() => {
    return Boolean(initialMood && goals.length > 0 && habits.length > 0);
  }, [goals.length, habits.length, initialMood]);

  const loadOnboardingStatus = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await wellnessService.getOnboarding(token);
      setIsOpen(Boolean(response.data?.needs_onboarding));
    } catch (error) {
      if (error instanceof ApiError && error.isUnauthorized) return;
      console.error("Failed to load wellness onboarding:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadOnboardingStatus();
  }, [loadOnboardingStatus]);

  useEffect(() => {
    emitWellnessOnboardingState(isOpen);
  }, [isOpen]);

  useEffect(() => {
    return () => emitWellnessOnboardingState(false);
  }, []);

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleSubmit = async () => {
    if (!token || !canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await wellnessService.completeOnboarding(token, {
        initial_mood: initialMood,
        goals,
        habits,
      });
      toast.success("Rencana 7 hari berhasil dibuat.");
      setIsOpen(false);
      window.dispatchEvent(new Event("wellness-refresh"));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal membuat rencana wellness.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token || isLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-2xl border-emerald-100 bg-white p-0">
        <div className="border-b border-emerald-100 bg-emerald-50/80 px-5 py-5 sm:px-6">
          <DialogHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <DialogTitle>Bangun Rencana Tenang 7 Hari</DialogTitle>
            <DialogDescription className="text-gray-600">
              Jawab singkat agar dashboard menyusun urutan mood, napas, jurnal, chat AI, dan reward yang lebih terarah.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="grid gap-5 px-5 py-5 sm:px-6">
          <section>
            <p className="text-sm font-semibold text-gray-900">Saat mulai, kamu paling dekat dengan kondisi apa?</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {moodOptions.map((option) => {
                const isSelected = initialMood === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setInitialMood(option.value)}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors",
                      isSelected
                        ? "border-emerald-300 bg-emerald-100 text-emerald-950"
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:border-emerald-200 hover:bg-emerald-50"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <p className="text-sm font-semibold text-gray-900">Tujuan minggu ini</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {goalOptions.map((goal) => {
                const isSelected = goals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setGoals((current) => toggleSelection(current, goal))}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                      isSelected
                        ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                        : "border-gray-200 bg-white text-gray-700 hover:border-emerald-200"
                    )}
                  >
                    <span className={cn(
                      "grid h-5 w-5 shrink-0 place-items-center rounded-md border",
                      isSelected ? "border-emerald-400 bg-emerald-500 text-white" : "border-gray-300 bg-gray-50"
                    )}>
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </span>
                    {goal}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <p className="text-sm font-semibold text-gray-900">Kebiasaan yang mungkin kamu jalankan</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {habitOptions.map((habit) => {
                const isSelected = habits.includes(habit);
                return (
                  <button
                    key={habit}
                    type="button"
                    onClick={() => setHabits((current) => toggleSelection(current, habit))}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                      isSelected
                        ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                        : "border-gray-200 bg-white text-gray-700 hover:border-emerald-200"
                    )}
                  >
                    <span className={cn(
                      "grid h-5 w-5 shrink-0 place-items-center rounded-md border",
                      isSelected ? "border-emerald-400 bg-emerald-500 text-white" : "border-gray-300 bg-gray-50"
                    )}>
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </span>
                    {habit}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <DialogFooter className="border-t border-gray-100 px-5 py-4 sm:px-6">
          <Button type="button" variant="ghost" onClick={closeModal} disabled={isSubmitting}>
            Nanti
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Buat Plan Saya
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
