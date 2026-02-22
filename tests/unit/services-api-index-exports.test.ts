import * as api from "@/services/api";
import { describe, expect, it } from "vitest";

describe("services api barrel exports", () => {
  it("exports expected domain services", () => {
    expect(api.authService).toBeDefined();
    expect(api.articleService).toBeDefined();
    expect(api.chatService).toBeDefined();
    expect(api.journalService).toBeDefined();
    expect(api.moderationService).toBeDefined();
    expect(api.uploadService).toBeDefined();
  });
});
