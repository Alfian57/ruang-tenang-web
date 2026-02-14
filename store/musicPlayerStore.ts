import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Song, Playlist } from "@/types";

export type RepeatMode = "off" | "all" | "one";

export interface PlaybackSource {
  type: "category" | "playlist" | "search";
  id?: number;
  name: string;
}

interface MusicPlayerState {
  // Current playback state
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  
  // Queue and playlist
  queue: Song[];
  queueIndex: number;
  playbackSource: PlaybackSource | null;
  
  // Playback modes
  shuffle: boolean;
  repeatMode: RepeatMode;
  
  // Player visibility
  isPlayerVisible: boolean;
  isMinimized: boolean;
  
  // Actions
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  
  // Queue actions
  setQueue: (songs: Song[], source: PlaybackSource) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setQueueIndex: (index: number) => void;
  
  // Playback actions
  playFromQueue: (index: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  
  // Play methods
  playSong: (song: Song, queue?: Song[], source?: PlaybackSource) => void;
  playPlaylist: (playlist: Playlist, startIndex?: number) => void;
  
  // Player visibility
  showPlayer: () => void;
  hidePlayer: () => void;
  toggleMinimize: () => void;
  
  // Reset
  resetPlayer: () => void;
}

export const useMusicPlayerStore = create<MusicPlayerState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSong: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.7,
      isMuted: false,
      
      queue: [],
      queueIndex: 0,
      playbackSource: null,
      
      shuffle: false,
      repeatMode: "off" as RepeatMode,
      
      isPlayerVisible: false,
      isMinimized: false,
      
      // State setters
      setCurrentSong: (song) => set({ currentSong: song, isPlayerVisible: song !== null }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration }),
      setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      
      // Queue actions
      setQueue: (songs, source) => set({ queue: songs, playbackSource: source }),
      addToQueue: (song) => set((state) => ({ queue: [...state.queue, song] })),
      removeFromQueue: (index) => set((state) => ({
        queue: state.queue.filter((_, i) => i !== index),
        queueIndex: state.queueIndex > index ? state.queueIndex - 1 : state.queueIndex,
      })),
      clearQueue: () => set({ queue: [], queueIndex: 0, playbackSource: null }),
      setQueueIndex: (index) => set({ queueIndex: index }),
      
      // Playback actions
      playFromQueue: (index) => {
        const { queue } = get();
        if (index >= 0 && index < queue.length) {
          set({
            currentSong: queue[index],
            queueIndex: index,
            isPlaying: true,
            currentTime: 0,
            isPlayerVisible: true,
          });
        }
      },
      
      playNext: () => {
        const { queue, queueIndex, repeatMode, shuffle } = get();
        if (queue.length === 0) return;
        
        let nextIndex: number;
        
        if (repeatMode === "one") {
          // Repeat the same song
          set({ currentTime: 0, isPlaying: true });
          return;
        }
        
        if (shuffle) {
          // Random next song (excluding current)
          const availableIndices = queue.map((_, i) => i).filter(i => i !== queueIndex);
          if (availableIndices.length === 0) {
            nextIndex = queueIndex;
          } else {
            nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
          }
        } else {
          nextIndex = queueIndex + 1;
        }
        
        if (nextIndex >= queue.length) {
          if (repeatMode === "all") {
            nextIndex = 0;
          } else {
            // Stop playback at end of queue
            set({ isPlaying: false });
            return;
          }
        }
        
        set({
          currentSong: queue[nextIndex],
          queueIndex: nextIndex,
          currentTime: 0,
          isPlaying: true,
        });
      },
      
      playPrevious: () => {
        const { queue, queueIndex, currentTime, repeatMode } = get();
        if (queue.length === 0) return;
        
        // If more than 3 seconds in, restart current song
        if (currentTime > 3) {
          set({ currentTime: 0 });
          return;
        }
        
        let prevIndex = queueIndex - 1;
        
        if (prevIndex < 0) {
          if (repeatMode === "all") {
            prevIndex = queue.length - 1;
          } else {
            prevIndex = 0;
          }
        }
        
        set({
          currentSong: queue[prevIndex],
          queueIndex: prevIndex,
          currentTime: 0,
          isPlaying: true,
        });
      },
      
      toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
      
      toggleRepeat: () => set((state) => {
        const modes: RepeatMode[] = ["off", "all", "one"];
        const currentIndex = modes.indexOf(state.repeatMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        return { repeatMode: modes[nextIndex] };
      }),
      
      // Play methods
      playSong: (song, queue, source) => {
        const state = get();
        
        // If same song, toggle play/pause
        if (state.currentSong?.id === song.id) {
          set({ isPlaying: !state.isPlaying });
          return;
        }
        
        // If queue provided, set it
        if (queue && source) {
          const songIndex = queue.findIndex(s => s.id === song.id);
          set({
            currentSong: song,
            queue: queue,
            queueIndex: songIndex >= 0 ? songIndex : 0,
            playbackSource: source,
            isPlaying: true,
            currentTime: 0,
            isPlayerVisible: true,
          });
        } else {
          // Just play single song
          const existingIndex = state.queue.findIndex(s => s.id === song.id);
          if (existingIndex >= 0) {
            // Song exists in queue, play from there
            set({
              currentSong: song,
              queueIndex: existingIndex,
              isPlaying: true,
              currentTime: 0,
              isPlayerVisible: true,
            });
          } else {
            // Add to queue and play
            const newQueue = [...state.queue, song];
            set({
              currentSong: song,
              queue: newQueue,
              queueIndex: newQueue.length - 1,
              isPlaying: true,
              currentTime: 0,
              isPlayerVisible: true,
            });
          }
        }
      },
      
      playPlaylist: (playlist, startIndex = 0) => {
        if (!playlist.items || playlist.items.length === 0) return;
        
        const songs = playlist.items
          .sort((a, b) => a.position - b.position)
          .map(item => item.song)
          .filter((song): song is Song => song !== undefined);
        
        if (songs.length === 0) return;
        
        const source: PlaybackSource = {
          type: "playlist",
          id: playlist.id,
          name: playlist.name,
        };
        
        set({
          currentSong: songs[startIndex] || songs[0],
          queue: songs,
          queueIndex: startIndex,
          playbackSource: source,
          isPlaying: true,
          currentTime: 0,
          isPlayerVisible: true,
        });
      },
      
      // Player visibility
      showPlayer: () => set({ isPlayerVisible: true }),
      hidePlayer: () => set({ isPlayerVisible: false, isPlaying: false }),
      toggleMinimize: () => set((state) => ({ isMinimized: !state.isMinimized })),
      
      // Reset
      resetPlayer: () => set({
        currentSong: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        queue: [],
        queueIndex: 0,
        playbackSource: null,
        isPlayerVisible: false,
        isMinimized: false,
      }),
    }),
    {
      name: "music-player-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these values
        volume: state.volume,
        isMuted: state.isMuted,
        shuffle: state.shuffle,
        repeatMode: state.repeatMode,
        // Persist queue and current song for resume
        queue: state.queue,
        queueIndex: state.queueIndex,
        currentSong: state.currentSong,
        playbackSource: state.playbackSource,
        currentTime: state.currentTime,
      }),
    }
  )
);
