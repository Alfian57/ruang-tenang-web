import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MinimizedPlayer } from "@/components/layout/player/MinimizedPlayer";

const song = {
    id: "s-1",
    title: "Fokus Tenang",
    thumbnail: "",
    category: { name: "Lo-fi" },
} as any;

describe("MinimizedPlayer", () => {
    it("renders song info and playback source", () => {
        render(
            <MinimizedPlayer
                currentSong={song}
                playbackSourceName="Playlist Belajar"
                isPlaying
                onPlayPrevious={vi.fn()}
                onTogglePlay={vi.fn()}
                onPlayNext={vi.fn()}
                onToggleMinimize={vi.fn()}
            />
        );

        expect(screen.getByText("Fokus Tenang")).toBeInTheDocument();
        expect(screen.getByText("Playlist Belajar")).toBeInTheDocument();
    });

    it("fires playback controls", () => {
        const onPlayPrevious = vi.fn();
        const onTogglePlay = vi.fn();
        const onPlayNext = vi.fn();
        const onToggleMinimize = vi.fn();

        render(
            <MinimizedPlayer
                currentSong={song}
                isPlaying={false}
                onPlayPrevious={onPlayPrevious}
                onTogglePlay={onTogglePlay}
                onPlayNext={onPlayNext}
                onToggleMinimize={onToggleMinimize}
            />
        );

        const buttons = screen.getAllByRole("button");
        fireEvent.click(buttons[0]);
        fireEvent.click(buttons[1]);
        fireEvent.click(buttons[2]);
        fireEvent.click(buttons[3]);

        expect(onPlayPrevious).toHaveBeenCalledTimes(1);
        expect(onTogglePlay).toHaveBeenCalledTimes(1);
        expect(onPlayNext).toHaveBeenCalledTimes(1);
        expect(onToggleMinimize).toHaveBeenCalledTimes(1);
    });
});
