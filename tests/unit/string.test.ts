import { capitalize, getHtmlExcerpt, slugify, truncate } from "@/utils/string";

describe("utils/string", () => {
  it("truncate shortens long text with ellipsis", () => {
    expect(truncate("ruang tenang", 5)).toBe("ruang...");
    expect(truncate("halo", 10)).toBe("halo");
  });

  it("capitalize uppercases first character", () => {
    expect(capitalize("tenang")).toBe("Tenang");
    expect(capitalize("")).toBe("");
  });

  it("slugify creates clean slug", () => {
    expect(slugify("  Ruang Tenang 2026!!  ")).toBe("ruang-tenang-2026");
  });

  it("getHtmlExcerpt strips html and truncates", () => {
    const html = "<p>Halo <strong>dunia</strong> damai selalu</p>";
    expect(getHtmlExcerpt(html, 10)).toBe("Halo dunia....");
  });
});
