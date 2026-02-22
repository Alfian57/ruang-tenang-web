import { PAGINATION } from "@/constants";

describe("constants pagination", () => {
  it("uses expected pagination defaults", () => {
    expect(PAGINATION.DEFAULT_PAGE).toBe(1);
    expect(PAGINATION.DEFAULT_LIMIT).toBe(10);
    expect(PAGINATION.MAX_LIMIT).toBe(100);
  });

  it("keeps max limit above default limit", () => {
    expect(PAGINATION.MAX_LIMIT).toBeGreaterThan(PAGINATION.DEFAULT_LIMIT);
  });
});
