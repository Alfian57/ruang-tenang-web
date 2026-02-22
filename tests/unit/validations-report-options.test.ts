import { createReportSchema, reportReasonOptions } from "@/services/schema/validations";

describe("validations report reason options", () => {
  it("contains expected reason options", () => {
    expect(reportReasonOptions).toContain("spam");
    expect(reportReasonOptions).toContain("harassment");
    expect(reportReasonOptions).toContain("self_harm");
  });

  it("uses custom message when reason is invalid", () => {
    const result = createReportSchema.safeParse({
      reported_id: "550e8400-e29b-41d4-a716-446655440000",
      content_type: "article",
      reason: "invalid",
      description: "Deskripsi laporan valid dengan panjang cukup",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const reasonIssue = result.error.issues.find((issue) => issue.path.join(".") === "reason");
      expect(reasonIssue?.message).toBe("Pilih alasan laporan");
    }
  });
});
