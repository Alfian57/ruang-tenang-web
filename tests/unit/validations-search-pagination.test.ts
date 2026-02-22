import { paginationSchema, searchSchema } from "@/services/schema/validations";

describe("validations search and pagination", () => {
  it("validates search payload", () => {
    expect(searchSchema.safeParse({ q: "musik", type: "songs" }).success).toBe(true);
  });

  it("rejects xss search keyword", () => {
    expect(searchSchema.safeParse({ q: "<script>alert(1)</script>" }).success).toBe(false);
  });

  it("coerces and validates pagination", () => {
    const result = paginationSchema.safeParse({ page: "2", limit: "20" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(20);
    }
  });
});
