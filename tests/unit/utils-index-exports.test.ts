import * as utils from "@/utils";
import { describe, expect, it } from "vitest";

describe("utils barrel exports", () => {
  it("exports key utility functions", () => {
    expect(typeof utils.cn).toBe("function");
    expect(typeof utils.formatDate).toBe("function");
    expect(typeof utils.truncate).toBe("function");
    expect(typeof utils.getMoodEmoji).toBe("function");
  });
});
