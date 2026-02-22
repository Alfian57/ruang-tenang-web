import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ExpandedPlayer } from "@/components/layout/player/ExpandedPlayer";

const song = {
    id: "s-1",
    title: "Ruang Nafas",
    thumbnail: "",
    category: { name: "Healing" },
} as any;

describe("ExpandedPlayer", () => {
    it("renders queue info and formatted duration", () => {
        render(
            <ExpandedPlayer
                currentSong={song}
                isPlaying={false}
                currentTime={65}
                duration={125}
                volume={0.6}
                isMuted={false}
                queueLength={3}
                queueIndex={1}
                shuffle={false}
                repeatMode="off"
                onSeek={vi.fn()}
                onTogglePlay={vi.fn()}
                onPlayPrevious={vi.fn()}
                onPlayNext={vi.fn()}
                onToggleShuffle={vi.fn()}
                onToggleRepeat={vi.fn()}
                onToggleMute={vi.fn()}
                onVolumeChange={vi.fn()}
                onToggleMinimize={vi.fn()}
                onHidePlayer={vi.fn()}
            />
        );

        expect(screen.getByText("Ruang Nafas")).toBeInTheDocument();
        expect(screen.getByText("2 / 3")).toBeInTheDocument();
        expect(screen.getByText("1:05")).toBeInTheDocument();
        expect(screen.getByText("2:05")).toBeInTheDocument();
    });

    it("fires control callbacks", () => {
        const onTogglePlay = vi.fn();
        const onPlayPrevious = vi.fn();
        const onPlayNext = vi.fn();
        const onToggleShuffle = vi.fn();
        const onToggleRepeat = vi.fn();
        const onToggleMute = vi.fn();
        const onToggleMinimize = vi.fn();
        const onHidePlayer = vi.fn();

        render(
            <ExpandedPlayer
                currentSong={song}
                isPlaying
                currentTime={0}
                duration={100}
                volume={0.5}
                isMuted={false}
                queueLength={1}
                queueIndex={0}
                shuffle={false}
                repeatMode="all"
                onSeek={vi.fn()}
                onTogglePlay={onTogglePlay}
                onPlayPrevious={onPlayPrevious}
                onPlayNext={onPlayNext}
                onToggleShuffle={onToggleShuffle}
                onToggleRepeat={onToggleRepeat}
                onToggleMute={onToggleMute}
                onVolumeChange={vi.fn()}
                onToggleMinimize={onToggleMinimize}
                onHidePlayer={onHidePlayer}
            />
        );

        const buttons = screen.getAllByRole("button");
        fireEvent.click(buttons[0]);
        fireEvent.click(buttons[1]);
        fireEvent.click(buttons[2]);
        fireEvent.click(buttons[3]);
        fireEvent.click(buttons[4]);
        fireEvent.click(buttons[5]);
        fireEvent.click(buttons[6]);
        fireEvent.click(buttons[7]);

        expect(onToggleShuffle).toHaveBeenCalledTimes(1);
        expect(onPlayPrevious).toHaveBeenCalledTimes(1);
        expect(onTogglePlay).toHaveBeenCalledTimes(1);
        expect(onPlayNext).toHaveBeenCalledTimes(1);
        expect(onToggleRepeat).toHaveBeenCalledTimes(1);
        expect(onToggleMute).toHaveBeenCalledTimes(1);
        expect(onToggleMinimize).toHaveBeenCalledTimes(1);
        expect(onHidePlayer).toHaveBeenCalledTimes(1);
    });
});
