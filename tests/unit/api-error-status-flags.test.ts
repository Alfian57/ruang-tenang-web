import { ApiError } from "@/services/http/types";

describe("ApiError status flags", () => {
  it("detects unauthorized and forbidden statuses", () => {
    expect(new ApiError({ message: "u", status: 401 }).isUnauthorized).toBe(true);
    expect(new ApiError({ message: "f", status: 403 }).isForbidden).toBe(true);
  });

  it("detects not found and rate limited statuses", () => {
    expect(new ApiError({ message: "n", status: 404 }).isNotFound).toBe(true);
    expect(new ApiError({ message: "r", status: 429 }).isRateLimited).toBe(true);
  });
});
