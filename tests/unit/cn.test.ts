import { describe, expect, it } from "vitest";

import { cn } from "@/lib/cn";

describe("cn", () => {
  it("merges conditional classes", () => {
    const result = cn("px-2", false && "hidden", "text-sm", null, undefined);

    expect(result).toContain("px-2");
    expect(result).toContain("text-sm");
    expect(result).not.toContain("hidden");
  });

  it("resolves conflicting tailwind classes with latest one", () => {
    const result = cn("p-2", "p-4", "text-xs", "text-base");

    expect(result).toContain("p-4");
    expect(result).toContain("text-base");
    expect(result).not.toContain("p-2");
    expect(result).not.toContain("text-xs");
  });
});
