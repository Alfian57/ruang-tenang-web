import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  parseApiDate,
} from "@/utils/date";

describe("utils/date", () => {
  it("parseApiDate strips trailing Z and returns Date", () => {
    const parsed = parseApiDate("2026-02-21T12:00:00Z");

    expect(parsed).toBeInstanceOf(Date);
    expect(Number.isNaN(parsed.getTime())).toBe(false);
  });

  it("parseApiDate returns same Date instance if Date input", () => {
    const date = new Date("2026-02-21T12:00:00");
    const parsed = parseApiDate(date);

    expect(parsed).toBe(date);
  });

  it("formatDate and formatDateTime return non-empty Indonesian formatted strings", () => {
    const date = "2026-02-21T12:00:00";
    const formattedDate = formatDate(date);
    const formattedDateTime = formatDateTime(date);

    expect(formattedDate).toContain("2026");
    expect(formattedDateTime).toContain("2026");
  });

  it("formatRelativeTime handles minute/hour/day ranges", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-21T12:00:00"));

    expect(formatRelativeTime("2026-02-21T11:59:30")).toBe("Baru saja");
    expect(formatRelativeTime("2026-02-21T11:50:00")).toBe("10 menit yang lalu");
    expect(formatRelativeTime("2026-02-21T10:00:00")).toBe("2 jam yang lalu");
    expect(formatRelativeTime("2026-02-19T12:00:00")).toBe("2 hari yang lalu");

    vi.useRealTimers();
  });
});
