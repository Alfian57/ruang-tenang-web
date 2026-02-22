import { describe, expect, it } from "vitest";

import {
  JournalEditor,
  JournalList,
  JournalDetail,
  JournalPrivacySettings,
  JournalAIAccessLogs,
  JournalAIContextPreview,
  JournalAnalytics,
  JournalWeeklySummary,
  JournalFilters,
} from "@/app/dashboard/journal/_components";

describe("journal components index", () => {
  it("exports expected components", () => {
    expect(JournalEditor).toBeTruthy();
    expect(JournalList).toBeTruthy();
    expect(JournalDetail).toBeTruthy();
    expect(JournalPrivacySettings).toBeTruthy();
    expect(JournalAIAccessLogs).toBeTruthy();
    expect(JournalAIContextPreview).toBeTruthy();
    expect(JournalAnalytics).toBeTruthy();
    expect(JournalWeeklySummary).toBeTruthy();
    expect(JournalFilters).toBeTruthy();
  });
});
