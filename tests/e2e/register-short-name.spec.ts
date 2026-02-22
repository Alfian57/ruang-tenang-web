import { expect, test } from "@playwright/test";

test("register rejects too-short name", async ({ page }) => {
  await page.goto("/register");

  await page.getByLabel("Nama Lengkap").fill("A");
  await page.getByLabel("Email").fill("valid@example.com");
  await page.locator("#password").fill("password123");
  await page.locator("#confirmPassword").fill("password123");
  await page.getByRole("button", { name: "Daftar" }).click();

  await expect(page.getByText("Nama minimal 2 karakter")).toBeVisible();
});
