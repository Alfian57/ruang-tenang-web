import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GlobalMusicPlayer } from "@/components/layout/GlobalMusicPlayer";

const storeState = {
    currentSong: null as any,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
    queue: [],
    queueIndex: 0,
    playbackSource: null as any,
    shuffle: false,
    repeatMode: "off" as const,
    isPlayerVisible: false,
    isMinimized: false,
    setIsPlaying: vi.fn(),
    setCurrentTime: vi.fn(),
    setDuration: vi.fn(),
    setVolume: vi.fn(),
    toggleMute: vi.fn(),
    playNext: vi.fn(),
    playPrevious: vi.fn(),
    toggleShuffle: vi.fn(),
    toggleRepeat: vi.fn(),
    toggleMinimize: vi.fn(),
    hidePlayer: vi.fn(),
};

vi.mock("framer-motion", () => ({
    AnimatePresence: ({ children }: { children: any }) => <>{children}</>,
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
}));

vi.mock("@/store/musicPlayerStore", () => ({
    useMusicPlayerStore: () => storeState,
}));

vi.mock("@/components/layout/player/MinimizedPlayer", () => ({
    MinimizedPlayer: ({ currentSong }: any) => <div>Minimized: {currentSong.title}</div>,
}));

vi.mock("@/components/layout/player/ExpandedPlayer", () => ({
    ExpandedPlayer: ({ currentSong }: any) => <div>Expanded: {currentSong.title}</div>,
}));

describe("GlobalMusicPlayer", () => {
    it("does not render player when invisible", () => {
        storeState.isPlayerVisible = false;
        storeState.currentSong = null;

        render(<GlobalMusicPlayer />);

        expect(screen.queryByText(/Minimized:/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Expanded:/)).not.toBeInTheDocument();
    });

    it("renders minimized and expanded player based on state", () => {
        storeState.currentSong = { id: "s1", title: "Song One", file_path: "/audio.mp3" };
        storeState.isPlayerVisible = true;
        storeState.isMinimized = true;

        const { rerender } = render(<GlobalMusicPlayer />);

        expect(screen.getByText("Minimized: Song One")).toBeInTheDocument();

        storeState.isMinimized = false;
        rerender(<GlobalMusicPlayer />);

        expect(screen.getByText("Expanded: Song One")).toBeInTheDocument();
    });
});
