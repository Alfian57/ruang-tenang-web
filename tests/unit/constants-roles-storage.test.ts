import { ROLES, STORAGE_KEYS } from "@/constants";

describe("constants roles and storage keys", () => {
  it("defines roles used by app", () => {
    expect(ROLES.ADMIN).toBe("admin");
    expect(ROLES.MODERATOR).toBe("moderator");
    expect(ROLES.MEMBER).toBe("member");
  });

  it("defines auth storage key", () => {
    expect(STORAGE_KEYS.AUTH).toBe("auth-storage");
  });
});
