"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, Gift, Lock, RefreshCw, Trophy, X, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { DailyTask } from "@/types";
import { communityService } from "@/services/api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useDashboardStore } from "@/store/dashboardStore";

interface DailyTaskFABProps {
  className?: string;
}

export function DailyTaskFAB({ className }: DailyTaskFABProps) {
  const { token, refreshUser } = useAuthStore();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { taskRefreshTrigger } = useDashboardStore();

  const loadTasks = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await communityService.getDailyTasks(token);
      // API returns DailyTaskSummary which has tasks property
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = response?.data as any;
      if (data?.tasks && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      } else if (Array.isArray(data)) {
        // Fallback if API returns array directly
        setTasks(data);
      }
    } catch (error) {
      console.error("Failed to load daily tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks, taskRefreshTrigger]);

  // Refresh tasks when the panel is opened
  useEffect(() => {
    if (isOpen) {
      loadTasks();
    }
  }, [isOpen, loadTasks]);

  // Poll every 30s so FAB stays in sync with other components
  useEffect(() => {
    const interval = setInterval(loadTasks, 30_000);
    return () => clearInterval(interval);
  }, [loadTasks]);

  const handleClaim = async (task: DailyTask) => {
    if (!token || claimingId !== null) return;

    setClaimingId(task.id);
    try {
      const response = await communityService.claimTaskReward(token, task.id);
      if (response.data) {
        toast.success(`Berhasil klaim! +${response.data.xp_earned} EXP`);
        if (response.data.level_up) {
          toast.success("Level Up!", {
            description: "Selamat! Kamu naik level 🎉",
          });
        }
        loadTasks();
        refreshUser(); // Refresh user data to update EXP in navbar
      }
    } catch (error) {
      console.error("Failed to claim task:", error);
      toast.error("Gagal mengklaim hadiah");
    } finally {
      setClaimingId(null);
    }
  };

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.is_completed).length;
  const claimableTasks = tasks.filter((t) => t.is_completed && !t.is_claimed).length;
  const claimedTasks = tasks.filter((t) => t.is_claimed).length;
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  if (!token || totalTasks === 0) return null;

  return (
    <>
      {/* Backdrop when open - click to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* FAB Container */}
      <div className={cn("fixed bottom-6 right-6 z-40", className)}>
        {/* Panel (above FAB) */}
        <div
          className={cn(
            "absolute bottom-full right-0 mb-3 w-96 bg-white rounded-2xl shadow-2xl border overflow-hidden transition-all duration-300 origin-bottom-right",
            isOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4 pointer-events-none"
          )}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-400 p-4 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-5 h-5" />
                  <h3 className="font-bold text-lg">Misi Harian</h3>
                </div>
                <p className="text-white/80 text-xs">Selesaikan misi, klaim hadiahmu!</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="mt-3 flex items-center gap-3 relative">
              <div className="flex-1 h-2.5 bg-black/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-sm font-bold min-w-[40px] text-right">
                {claimedTasks}/{totalTasks}
              </span>
            </div>
          </div>

          {/* Tasks list */}
          <div className="max-h-72 overflow-y-auto divide-y">
            {isLoading ? (
              <div className="p-6 text-center">
                <RefreshCw className="w-6 h-6 mx-auto animate-spin text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Memuat misi...</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "p-3 flex items-center justify-between hover:bg-gray-50 transition-colors",
                    task.is_claimed && "bg-green-50/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-base",
                        task.is_claimed
                          ? "bg-green-100 text-green-600"
                          : task.is_completed
                          ? "bg-orange-100 text-orange-600"
                          : "bg-gray-100 text-gray-400"
                      )}
                    >
                      {task.task_icon}
                    </div>
                    <div>
                      <h4
                        className={cn(
                          "font-medium text-sm",
                          task.is_claimed && "text-green-700"
                        )}
                      >
                        {task.task_name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-200 font-medium">
                          +{task.xp_reward} XP
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {task.current_count}/{task.target_count}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {task.is_claimed ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : task.is_completed ? (
                      <Button
                        size="sm"
                        onClick={() => handleClaim(task)}
                        disabled={claimingId === task.id}
                        className={cn(
                          "bg-orange-500 hover:bg-orange-600 text-white rounded-full h-7 px-3 text-xs shadow-sm font-medium",
                          claimingId === task.id && "opacity-80"
                        )}
                      >
                        {claimingId === task.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <Gift className="w-3 h-3 mr-1" />
                            Klaim
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="w-7 h-7 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300">
                        <Lock className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-gray-50 border-t">
            <p className="text-[10px] text-center text-gray-400">
              Reset setiap hari pukul 00:00 WIB
            </p>
          </div>
        </div>

        {/* FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 relative group",
            "bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-400",
            "hover:shadow-xl hover:scale-105 active:scale-95",
            isOpen && "rotate-180 bg-gradient-to-br from-gray-600 to-gray-700",
            claimableTasks > 0 && !isOpen && "animate-bounce"
          )}
        >
          {/* Glow effect */}
          {claimableTasks > 0 && !isOpen && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 animate-ping opacity-40" />
          )}

          {/* Icon */}
          <div className="relative">
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <ClipboardList className="w-8 h-8 text-white" />
            )}
          </div>

          {/* Badge counter */}
          {claimableTasks > 0 && !isOpen && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md border-2 border-white">
              {claimableTasks}
            </div>
          )}

          {/* Tooltip */}
          {!isOpen && (
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span className="font-medium">Misi Harian</span>
              {claimableTasks > 0 && (
                <span className="text-orange-300 ml-1">({claimableTasks} siap klaim)</span>
              )}
              <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-full border-8 border-transparent border-l-gray-800" />
            </div>
          )}
        </button>
      </div>
    </>
  );
}
