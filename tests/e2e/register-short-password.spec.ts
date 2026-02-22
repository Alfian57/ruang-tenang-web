import { expect, test } from "@playwright/test";

test("register rejects short password", async ({ page }) => {
  await page.goto("/register");

  await page.getByLabel("Nama Lengkap").fill("Budi Santoso");
  await page.getByLabel("Email").fill("budi@example.com");
  await page.locator("#password").fill("123");
  await page.locator("#confirmPassword").fill("123");
  await page.getByRole("button", { name: "Daftar" }).click();

  await expect(page.getByText("Password minimal 6 karakter")).toBeVisible();
});
