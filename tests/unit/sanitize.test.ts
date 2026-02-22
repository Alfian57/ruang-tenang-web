import { sanitizeHtml } from "@/utils/sanitize";

describe("utils/sanitize", () => {
  it("returns empty string for empty input", () => {
    expect(sanitizeHtml("")).toBe("");
  });

  it("removes script tags", () => {
    const unsafe = '<p>aman</p><script>alert("xss")</script>';
    const sanitized = sanitizeHtml(unsafe);

    expect(sanitized).toContain("<p>aman</p>");
    expect(sanitized.toLowerCase()).not.toContain("<script");
  });

  it("keeps safe formatting tags", () => {
    const rich = "<strong>tebal</strong><em>miring</em>";
    const sanitized = sanitizeHtml(rich);

    expect(sanitized).toContain("<strong>tebal</strong>");
    expect(sanitized).toContain("<em>miring</em>");
  });
});
