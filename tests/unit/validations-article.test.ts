import { createArticleSchema, updateArticleSchema } from "@/services/schema/validations";

const uuid = "550e8400-e29b-41d4-a716-446655440000";

describe("validations article", () => {
  it("validates create article payload", () => {
    const result = createArticleSchema.safeParse({
      title: "Judul Artikel Bagus",
      content: "Ini konten artikel yang valid dan cukup panjang",
      category_id: uuid,
      thumbnail_url: "",
      is_public: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects create article payload containing script", () => {
    const result = createArticleSchema.safeParse({
      title: "<script>alert(1)</script>",
      content: "Ini konten artikel yang valid dan cukup panjang",
      category_id: uuid,
      is_public: true,
    });
    expect(result.success).toBe(false);
  });

  it("validates partial update payload", () => {
    expect(updateArticleSchema.safeParse({ title: "Judul Baru" }).success).toBe(true);
  });
});
