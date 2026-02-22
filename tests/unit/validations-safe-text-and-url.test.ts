import { safeTextSchema, urlSchema } from "@/services/schema/validations";

describe("validations safe text and url", () => {
  it("accepts safe text and rejects xss-like input", () => {
    expect(safeTextSchema.safeParse("halo teman").success).toBe(true);
    expect(safeTextSchema.safeParse("<iframe src='x'></iframe>").success).toBe(false);
  });

  it("accepts valid url and rejects javascript scheme", () => {
    expect(urlSchema.safeParse("https://example.com/a.png").success).toBe(true);
    expect(urlSchema.safeParse("javascript:alert(1)").success).toBe(false);
  });
});
