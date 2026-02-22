import { emailSchema, loginPasswordSchema, passwordSchema } from "@/services/schema/validations";

describe("validations email and password", () => {
  it("accepts valid email and rejects invalid", () => {
    expect(emailSchema.safeParse("user@example.com").success).toBe(true);
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
  });

  it("enforces strong password and simple login password", () => {
    expect(passwordSchema.safeParse("Password123").success).toBe(true);
    expect(passwordSchema.safeParse("password").success).toBe(false);
    expect(loginPasswordSchema.safeParse("x").success).toBe(true);
  });
});
