import { describe, expect, it } from "vitest";

import type { FilterType } from "@/app/dashboard/chat/_components/ChatSidebar";

describe("chat filter type", () => {
  it("accepts valid filter values", () => {
    const all: FilterType = "all";
    const favorites: FilterType = "favorites";
    const trash: FilterType = "trash";

    expect(all).toBe("all");
    expect(favorites).toBe("favorites");
    expect(trash).toBe("trash");
  });
});
