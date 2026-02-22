import {
  blockUserSchema,
  handleReportSchema,
  moderateArticleSchema,
} from "@/services/schema/validations";

const uuid = "550e8400-e29b-41d4-a716-446655440000";

describe("validations moderation", () => {
  it("validates block user payload", () => {
    expect(blockUserSchema.safeParse({ blocked_user_id: uuid, reason: "spam" }).success).toBe(true);
  });

  it("validates moderate article and handle report statuses", () => {
    expect(moderateArticleSchema.safeParse({ status: "approve" }).success).toBe(true);
    expect(handleReportSchema.safeParse({ status: "resolved" }).success).toBe(true);
  });

  it("rejects invalid moderation status", () => {
    expect(moderateArticleSchema.safeParse({ status: "invalid" }).success).toBe(false);
  });
});
