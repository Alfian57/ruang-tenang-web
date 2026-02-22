import { TIMEOUTS } from "@/constants";

describe("constants timeouts", () => {
  it("defines positive timeout values", () => {
    expect(TIMEOUTS.DEFAULT_REQUEST).toBeGreaterThan(0);
    expect(TIMEOUTS.AI_REQUEST).toBeGreaterThan(0);
    expect(TIMEOUTS.DEBOUNCE_SEARCH).toBeGreaterThan(0);
  });

  it("uses longer timeout for AI requests", () => {
    expect(TIMEOUTS.AI_REQUEST).toBeGreaterThan(TIMEOUTS.DEFAULT_REQUEST);
  });
});
