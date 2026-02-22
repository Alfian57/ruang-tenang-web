import {
  createReportSchema,
  loginSchema,
  registerSchema,
  safeTextSchema,
} from "@/services/schema/validations";

describe("services/schema/validations", () => {
  it("validates login payload", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "rahasia123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects register payload when password confirmation mismatch", () => {
    const result = registerSchema.safeParse({
      name: "Budi Santoso",
      email: "budi@example.com",
      password: "Password123",
      password_confirmation: "Password321",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Password tidak cocok");
    }
  });

  it("rejects unsafe XSS-like text", () => {
    const result = safeTextSchema.safeParse("<script>alert('x')</script>");
    expect(result.success).toBe(false);
  });

  it("validates report reason enum", () => {
    const payload = {
      reported_id: "550e8400-e29b-41d4-a716-446655440000",
      content_type: "article",
      reason: "spam",
      description: "Konten promosi tidak relevan untuk komunitas ini",
    };

    const result = createReportSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });
});
