
import { create } from 'zustand';

interface DashboardStore {
  moodRefreshTrigger: number;
  expRefreshTrigger: number;
  moodCheckinStatus: 'checking' | 'open' | 'ready';
  triggerMoodRefresh: () => void;
  triggerExpRefresh: () => void;
  setMoodCheckinStatus: (status: DashboardStore['moodCheckinStatus']) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  moodRefreshTrigger: 0,
  expRefreshTrigger: 0,
  moodCheckinStatus: 'checking',
  triggerMoodRefresh: () => set((state) => ({ moodRefreshTrigger: state.moodRefreshTrigger + 1 })),
  triggerExpRefresh: () => set((state) => ({ expRefreshTrigger: state.expRefreshTrigger + 1 })),
  setMoodCheckinStatus: (moodCheckinStatus) => set({ moodCheckinStatus }),
}));
