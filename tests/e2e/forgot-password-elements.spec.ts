import { expect, test } from "@playwright/test";

test("forgot password page shows expected elements", async ({ page }) => {
  await page.goto("/forgot-password");

  await expect(page.getByText("Lupa Password?")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByRole("button", { name: "Kirim Link Reset" })).toBeVisible();
});
