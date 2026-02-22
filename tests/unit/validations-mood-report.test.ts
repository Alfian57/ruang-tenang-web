import { createReportSchema, recordMoodSchema } from "@/services/schema/validations";

const uuid = "550e8400-e29b-41d4-a716-446655440000";

describe("validations mood and report", () => {
  it("validates mood boundaries", () => {
    expect(recordMoodSchema.safeParse({ mood_level: 1 }).success).toBe(true);
    expect(recordMoodSchema.safeParse({ mood_level: 5, note: "baik" }).success).toBe(true);
    expect(recordMoodSchema.safeParse({ mood_level: 0 }).success).toBe(false);
  });

  it("validates report payload and rejects invalid reason", () => {
    expect(
      createReportSchema.safeParse({
        reported_id: uuid,
        content_type: "forum",
        reason: "spam",
        description: "Deskripsi laporan valid dengan panjang yang cukup",
      }).success
    ).toBe(true);

    expect(
      createReportSchema.safeParse({
        reported_id: uuid,
        content_type: "forum",
        reason: "invalid_reason",
        description: "Deskripsi laporan valid dengan panjang yang cukup",
      }).success
    ).toBe(false);
  });
});
