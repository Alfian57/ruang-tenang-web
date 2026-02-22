import { expect, test } from "@playwright/test";

test.describe("Auth navigation", () => {
  test("navigates login to forgot password and back", async ({ page }) => {
    await page.goto("/login");

    const forgotPasswordLink = page.getByRole("link", { name: "Lupa Password?" });
    await expect(forgotPasswordLink).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/forgot-password$/, { timeout: 15000 }),
      forgotPasswordLink.click(),
    ]);

    await expect(page).toHaveURL(/\/forgot-password$/);
    await expect(page.getByText("Lupa Password?")).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/login$/, { timeout: 15000 }),
      page.getByRole("link", { name: "Kembali ke Login" }).first().click(),
    ]);

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  });
});
