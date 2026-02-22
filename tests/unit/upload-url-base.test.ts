describe("getUploadUrl base behavior", () => {
  it("returns empty string for empty input", async () => {
    const { getUploadUrl } = await import("@/services/http/upload-url");
    expect(getUploadUrl("")).toBe("");
  });

  it("returns absolute http path as-is", async () => {
    const { getUploadUrl } = await import("@/services/http/upload-url");
    const absolute = "https://cdn.example.com/file.jpg";
    expect(getUploadUrl(absolute)).toBe(absolute);
  });
});
