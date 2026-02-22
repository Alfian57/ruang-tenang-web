import { ROUTES } from "@/constants";

describe("constants routes", () => {
  it("contains essential auth and dashboard routes", () => {
    expect(ROUTES.HOME).toBe("/");
    expect(ROUTES.LOGIN).toBe("/login");
    expect(ROUTES.DASHBOARD).toBe("/dashboard");
    expect(ROUTES.MODERATION).toBe("/dashboard/moderation");
  });

  it("contains admin route group", () => {
    expect(ROUTES.ADMIN.USERS).toBe("/dashboard/admin/users");
    expect(ROUTES.ADMIN.ARTICLES).toBe("/dashboard/admin/articles");
    expect(ROUTES.ADMIN.SONGS).toBe("/dashboard/admin/songs");
  });
});
