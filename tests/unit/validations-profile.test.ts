import { updateProfileSchema } from "@/services/schema/validations";

describe("validations profile update", () => {
  it("accepts valid profile payload", () => {
    const result = updateProfileSchema.safeParse({
      name: "Budi Santoso",
      bio: "Halo dunia",
      avatar_url: "https://example.com/avatar.png",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty avatar url and rejects invalid name", () => {
    expect(updateProfileSchema.safeParse({ name: "Budi", avatar_url: "" }).success).toBe(true);
    expect(updateProfileSchema.safeParse({ name: "1", avatar_url: "" }).success).toBe(false);
  });
});
