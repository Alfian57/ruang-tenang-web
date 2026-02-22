import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Slider } from "@/components/ui/slider";

describe("Slider", () => {
    it("renders with default thumb position", () => {
        const { container } = render(<Slider defaultValue={[25]} />);

        const thumb = container.querySelector(".absolute.h-4.w-4");
        expect(thumb).toBeInTheDocument();
        expect(thumb).toHaveStyle({ left: "calc(25% - 8px)" });
    });

    it("updates value when track is clicked", () => {
        const onValueChange = vi.fn();
        const { container } = render(
            <Slider min={0} max={100} step={1} onValueChange={onValueChange} />
        );

        const track = container.querySelector(".relative.h-1\\.5.w-full") as HTMLDivElement;
        expect(track).toBeInTheDocument();

        vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
            x: 0,
            y: 0,
            width: 200,
            height: 10,
            top: 0,
            right: 200,
            bottom: 10,
            left: 0,
            toJSON: () => ({}),
        });

        fireEvent.mouseDown(track, { clientX: 100 });

        expect(onValueChange).toHaveBeenCalledWith([50]);
    });

    it("supports drag move lifecycle and stops after mouseup", () => {
        const onValueChange = vi.fn();
        const { container } = render(
            <Slider min={0} max={100} step={1} onValueChange={onValueChange} />
        );

        const thumb = container.querySelector(".absolute.h-4.w-4") as HTMLDivElement;
        const track = container.querySelector(".relative.h-1\\.5.w-full") as HTMLDivElement;

        vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
            x: 0,
            y: 0,
            width: 200,
            height: 10,
            top: 0,
            right: 200,
            bottom: 10,
            left: 0,
            toJSON: () => ({}),
        });

        fireEvent.mouseDown(thumb, { clientX: 20 });
        fireEvent.mouseMove(document, { clientX: 180 });
        fireEvent.mouseUp(document);
        fireEvent.mouseMove(document, { clientX: 40 });

        expect(onValueChange).toHaveBeenNthCalledWith(1, [10]);
        expect(onValueChange).toHaveBeenNthCalledWith(2, [90]);
        expect(onValueChange).toHaveBeenCalledTimes(2);
    });

    it("updates value on touch interactions", () => {
        const onValueChange = vi.fn();
        const { container } = render(
            <Slider min={0} max={100} step={10} onValueChange={onValueChange} />
        );

        const track = container.querySelector(".relative.h-1\\.5.w-full") as HTMLDivElement;

        vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
            x: 0,
            y: 0,
            width: 200,
            height: 10,
            top: 0,
            right: 200,
            bottom: 10,
            left: 0,
            toJSON: () => ({}),
        });

        fireEvent.touchStart(track, { touches: [{ clientX: 60 }] });
        fireEvent.touchMove(document, { touches: [{ clientX: 120 }] });
        fireEvent.touchEnd(document);

        expect(onValueChange).toHaveBeenNthCalledWith(1, [30]);
        expect(onValueChange).toHaveBeenNthCalledWith(2, [60]);
    });

    it("does not update when disabled and renders disabled state", () => {
        const onValueChange = vi.fn();
        const { container } = render(
            <Slider disabled onValueChange={onValueChange} />
        );

        const root = container.querySelector(".relative.flex.w-full") as HTMLDivElement;
        const track = container.querySelector(".relative.h-1\\.5.w-full") as HTMLDivElement;

        fireEvent.mouseDown(track, { clientX: 100 });

        expect(onValueChange).not.toHaveBeenCalled();
        expect(root).toHaveClass("opacity-50", "cursor-not-allowed");
    });
});
