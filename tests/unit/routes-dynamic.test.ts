import { ROUTES } from "@/lib/routes";

describe("lib/routes dynamic builders", () => {
  it("builds article and story detail routes", () => {
    expect(ROUTES.articleDetail("my-slug")).toBe("/dashboard/articles/my-slug");
    expect(ROUTES.articleRead("my-slug")).toBe("/dashboard/articles/read/my-slug");
    expect(ROUTES.storyDetail(123)).toBe("/dashboard/stories/123");
  });

  it("builds forum and moderation routes", () => {
    expect(ROUTES.forumDetail(77)).toBe("/dashboard/forum/77");
    expect(ROUTES.adminForumDetail("88")).toBe("/dashboard/admin/forums/88");
    expect(ROUTES.moderationArticle(9)).toBe("/dashboard/moderation/articles/9");
    expect(ROUTES.moderationReport("10")).toBe("/dashboard/moderation/reports/10");
  });
});
