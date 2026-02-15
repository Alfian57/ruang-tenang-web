
import { create } from 'zustand';

interface DashboardStore {
  moodRefreshTrigger: number;
  taskRefreshTrigger: number;
  expRefreshTrigger: number;
  triggerMoodRefresh: () => void;
  triggerTaskRefresh: () => void;
  triggerExpRefresh: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  moodRefreshTrigger: 0,
  taskRefreshTrigger: 0,
  expRefreshTrigger: 0,
  triggerMoodRefresh: () => set((state) => ({ moodRefreshTrigger: state.moodRefreshTrigger + 1 })),
  triggerTaskRefresh: () => set((state) => ({ taskRefreshTrigger: state.taskRefreshTrigger + 1 })),
  triggerExpRefresh: () => set((state) => ({ expRefreshTrigger: state.expRefreshTrigger + 1 })),
}));
