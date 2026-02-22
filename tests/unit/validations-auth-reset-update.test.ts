import {
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from "@/services/schema/validations";

describe("validations auth reset and update", () => {
  it("validates forgot password payload", () => {
    expect(forgotPasswordSchema.safeParse({ email: "user@example.com" }).success).toBe(true);
  });

  it("validates reset password and catches mismatch", () => {
    expect(
      resetPasswordSchema.safeParse({
        email: "user@example.com",
        token: "abc",
        password: "Password123",
        password_confirmation: "Password123",
      }).success
    ).toBe(true);

    expect(
      resetPasswordSchema.safeParse({
        email: "user@example.com",
        token: "abc",
        password: "Password123",
        password_confirmation: "Password321",
      }).success
    ).toBe(false);
  });

  it("validates update password payload", () => {
    expect(
      updatePasswordSchema.safeParse({
        old_password: "old-pass",
        new_password: "Password123",
        new_password_confirmation: "Password123",
      }).success
    ).toBe(true);
  });
});
