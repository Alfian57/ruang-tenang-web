import { expect, test } from "@playwright/test";

test("register page shows main form elements", async ({ page }) => {
  await page.goto("/register");

  await expect(page.getByLabel("Nama Lengkap")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.locator("#password")).toBeVisible();
  await expect(page.locator("#confirmPassword")).toBeVisible();
  await expect(page.getByRole("button", { name: "Daftar" })).toBeVisible();
});
