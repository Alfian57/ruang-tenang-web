import {
  createForumPostSchema,
  createForumSchema,
  createChatSessionSchema,
  sendMessageSchema,
} from "@/services/schema/validations";
import { describe, expect, it } from "vitest";

const uuid = "550e8400-e29b-41d4-a716-446655440000";

describe("validations forum and chat", () => {
  it("validates forum and forum post payloads", () => {
    expect(
      createForumSchema.safeParse({
        title: "Topik Diskusi Aman",
        content: "Konten diskusi yang aman dan cukup panjang",
        category_id: uuid,
      }).success
    ).toBe(true);

    expect(createForumPostSchema.safeParse({ content: "Balasan aman" }).success).toBe(true);
  });

  it("rejects xss forum post and empty chat message", () => {
    expect(createForumPostSchema.safeParse({ content: "<script>x</script>" }).success).toBe(false);
    expect(sendMessageSchema.safeParse({ content: "" }).success).toBe(false);
  });

  it("allows optional chat session title", () => {
    expect(createChatSessionSchema.safeParse({}).success).toBe(true);
  });
});
