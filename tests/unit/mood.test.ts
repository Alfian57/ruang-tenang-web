import { getAllMoods, getMoodColor, getMoodEmoji, getMoodLabel } from "@/utils/mood";

describe("utils/mood", () => {
  it("returns expected emoji, label, and color for valid mood", () => {
    expect(getMoodEmoji("happy")).toBe("😊");
    expect(getMoodLabel("happy")).toBe("Bahagia");
    expect(getMoodColor("happy")).toBe("text-green-500");
  });

  it("returns fallback values for unknown mood", () => {
    expect(getMoodEmoji("unknown")).toBe("🙂");
    expect(getMoodLabel("unknown")).toBe("unknown");
    expect(getMoodColor("unknown")).toBe("text-gray-500");
  });

  it("returns all supported moods", () => {
    const moods = getAllMoods();

    expect(moods).toContain("happy");
    expect(moods).toContain("neutral");
    expect(moods).toContain("angry");
    expect(moods).toContain("disappointed");
    expect(moods).toContain("sad");
    expect(moods).toContain("crying");
    expect(moods).toHaveLength(6);
  });
});
