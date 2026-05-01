"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Crown, Gift, Lock, RefreshCw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoinIcon } from "@/components/shared/CoinIcon";
import { cn } from "@/utils";
import { DailyTask } from "@/types";
import { communityService } from "@/services/api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/lib/routes";

interface DailyTaskWidgetProps {
  tasks: DailyTask[];
  onTaskClaimed: () => void;
  className?: string;
}

export function DailyTaskWidget({ tasks, onTaskClaimed, className }: DailyTaskWidgetProps) {
  const { token, user } = useAuthStore();
  const [claimingId, setClaimingId] = useState<number | null>(null);

  const handleClaim = async (task: DailyTask) => {
    if (!token || claimingId !== null) return;

    setClaimingId(task.id);
    try {
      const response = await communityService.claimTaskReward(token, task.id);
      if (response.data) {
        const parts = [`+${response.data.xp_earned} EXP`];
        if (response.data.coin_earned) parts.push(`+${response.data.coin_earned} koin`);
        toast.success(`Berhasil klaim! ${parts.join(" • ")}`);
        if (response.data.level_up) {
          toast.success("Naik Level!", {
            description: "Selamat! Kamu naik level 🎉"
          });
        }
        onTaskClaimed();
      }
    } catch (error) {
      console.error("Failed to claim task:", error);
      toast.error("Gagal mengklaim hadiah");
    } finally {
      setClaimingId(null);
    }
  };

  if (!tasks.length) return null;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const progressPercent = (completedTasks / totalTasks) * 100;
  const showPremiumTeasers = user?.role === "user" && !user?.is_premium && !tasks.some((task) => task.premium_only);

  return (
    <div className={cn("bg-white rounded-2xl shadow-sm border overflow-hidden", className)}>
      <div className="theme-fab-bg p-4 text-white">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-100" />
            <h3 className="font-bold">Misi Harian</h3>
          </div>
          <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
            Reset tiap 00:00
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-sm font-bold">{completedTasks}/{totalTasks}</span>
        </div>
      </div>

      <div className="divide-y">
        {tasks.map((task) => (
          <div key={task.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg",
                task.is_completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
              )}>
                {task.task_icon}
              </div>
              <div>
                <h4 className={cn("font-medium text-sm", task.is_completed && "text-gray-900")}>
                  {task.task_name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-200 font-medium">
                    +{task.xp_reward} XP
                  </span>
                  {task.premium_only && (
                    <span className="text-[10px] bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded border border-violet-200 font-medium inline-flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      Premium
                    </span>
                  )}
                  {task.coin_reward > 0 && (
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 font-medium inline-flex items-center gap-1">
                      <CoinIcon className="h-3 w-3" />
                      +{task.coin_reward}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    • {task.current_count}/{task.target_count}
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              {task.is_claimed ? (
                <div className="flex flex-col items-center">
                  <div className="bg-green-100 text-green-600 p-1.5 rounded-full">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-green-600 font-medium mt-1">Klaim</span>
                </div>
              ) : task.is_completed ? (
                <Button
                  size="sm"
                  onClick={() => handleClaim(task)}
                  disabled={claimingId === task.id}
                  className={cn(
                    "theme-accent-bg theme-accent-bg-hover text-white rounded-full h-8 px-4 shadow-sm animate-pulse font-medium",
                    claimingId === task.id && "animate-none opacity-80"
                  )}
                  style={{ backgroundColor: `var(--theme-accent)` }}
                >
                  {claimingId === task.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Gift className="w-3.5 h-3.5 mr-1.5" />
                      Klaim
                    </>
                  )}
                </Button>
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          </div>
        ))}

        {showPremiumTeasers && (
          <>
            {[
              {
                name: "Deep Chat Premium",
                description: "6 pesan reflektif dengan AI",
                xp: 55,
                coins: 8,
                icon: "✨",
              },
              {
                name: "Breathing Pro",
                description: "2 sesi pernafasan fokus",
                xp: 45,
                coins: 7,
                icon: "✦",
              },
            ].map((task) => (
              <div key={task.name} className="p-4 flex items-center justify-between bg-violet-50/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg bg-violet-100 text-violet-600">
                    {task.icon}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-medium text-sm text-violet-950">{task.name}</h4>
                      <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded border border-violet-200 font-medium inline-flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        Premium
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-violet-700">{task.description}</span>
                      <span className="text-[10px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-200 font-medium">
                        +{task.xp} XP
                      </span>
                      <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 font-medium inline-flex items-center gap-1">
                        <CoinIcon className="h-3 w-3" />
                        +{task.coins}
                      </span>
                    </div>
                  </div>
                </div>

                <Button asChild size="sm" variant="outline" className="h-8 shrink-0 rounded-full border-violet-200 bg-white text-violet-700 hover:bg-violet-100">
                  <Link href={ROUTES.BILLING}>
                    <Lock className="w-3.5 h-3.5 mr-1" />
                    Unlock
                  </Link>
                </Button>
              </div>
            ))}
          </>
        )}

        {tasks.length === 0 && (
          <div className="p-6 text-center text-gray-400 text-sm">
            Tidak ada misi aktif saat ini.
          </div>
        )}
      </div>
    </div>
  );
}
