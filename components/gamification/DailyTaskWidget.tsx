"use client";

import { useState } from "react";
import { Check, CheckCircle2, Circle, Gift, Lock, RefreshCw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DailyTask } from "@/types";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

interface DailyTaskWidgetProps {
  tasks: DailyTask[];
  onTaskClaimed: () => void;
  className?: string;
}

export function DailyTaskWidget({ tasks, onTaskClaimed, className }: DailyTaskWidgetProps) {
  const { token } = useAuthStore();
  const [claimingId, setClaimingId] = useState<number | null>(null);

  const handleClaim = async (task: DailyTask) => {
    if (!token || claimingId !== null) return;
    
    setClaimingId(task.id);
    try {
      const response = await api.claimDailyTask(token, task.id);
      if (response.success) {
        toast.success(`Berhasil klaim! +${response.exp_gained} EXP`, {
          description: response.message
        });
        if (response.level_up) {
           toast.success("Level Up!", {
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

  return (
    <div className={cn("bg-white rounded-2xl shadow-sm border overflow-hidden", className)}>
      <div className="bg-linear-to-r from-orange-400 to-amber-500 p-4 text-white">
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
                     "bg-orange-500 hover:bg-orange-600 text-white rounded-full h-8 px-4 shadow-sm animate-pulse font-medium",
                     claimingId === task.id && "animate-none opacity-80"
                   )}
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

        {tasks.length === 0 && (
          <div className="p-6 text-center text-gray-400 text-sm">
             Tidak ada misi aktif saat ini.
          </div>
        )}
      </div>
    </div>
  );
}
