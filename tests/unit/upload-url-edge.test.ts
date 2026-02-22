describe("getUploadUrl edge behavior", () => {
  it("keeps relative path prefixed with slash", async () => {
    const { getUploadUrl } = await import("@/services/http/upload-url");
    const url = getUploadUrl("uploads/a.png");
    expect(url).toContain("/uploads/a.png");
  });

  it("uses localhost fallback when base url is non-http", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "api.local/api/v1");
    const mod = await import("@/services/http/upload-url");
    const url = mod.getUploadUrl("/uploads/b.png");
    expect(url.startsWith("http://localhost:8080")).toBe(true);
    vi.unstubAllEnvs();
  });
});
