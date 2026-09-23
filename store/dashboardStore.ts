
import { create } from 'zustand';

interface DashboardStore {
  moodRefreshTrigger: number;
  expRefreshTrigger: number;
  triggerMoodRefresh: () => void;
  triggerExpRefresh: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  moodRefreshTrigger: 0,
  expRefreshTrigger: 0,
  triggerMoodRefresh: () => set((state) => ({ moodRefreshTrigger: state.moodRefreshTrigger + 1 })),
  triggerExpRefresh: () => set((state) => ({ expRefreshTrigger: state.expRefreshTrigger + 1 })),
}));
