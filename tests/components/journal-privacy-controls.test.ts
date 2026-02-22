import { describe, expect, it } from "vitest";

import {
  JournalAIAccessLogs,
  JournalAIContextPreview,
  JournalPrivacySettings,
} from "@/app/dashboard/journal/_components/JournalPrivacyControls";

describe("JournalPrivacyControls barrel", () => {
  it("re-exports privacy related components", () => {
    expect(JournalPrivacySettings).toBeDefined();
    expect(JournalAIAccessLogs).toBeDefined();
    expect(JournalAIContextPreview).toBeDefined();
  });
});
