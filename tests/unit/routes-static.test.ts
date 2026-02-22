import { ROUTES } from "@/lib/routes";

describe("lib/routes static paths", () => {
  it("defines key public and auth routes", () => {
    expect(ROUTES.HOME).toBe("/");
    expect(ROUTES.LOGIN).toBe("/login");
    expect(ROUTES.REGISTER).toBe("/register");
    expect(ROUTES.FORGOT_PASSWORD).toBe("/forgot-password");
  });

  it("defines key dashboard routes", () => {
    expect(ROUTES.DASHBOARD).toBe("/dashboard");
    expect(ROUTES.CHAT).toBe("/dashboard/chat");
    expect(ROUTES.JOURNAL).toBe("/dashboard/journal");
    expect(ROUTES.ARTICLES).toBe("/dashboard/articles");
  });
});
