import { expect, test } from "@playwright/test";

test.describe("Register validation", () => {
  test("shows required validation errors on empty submit", async ({ page }) => {
    await page.goto("/register");

    await page.getByRole("button", { name: "Daftar" }).click();

    await expect(page.getByText("Nama minimal 2 karakter")).toBeVisible();
    await expect(page.getByText("Email tidak valid")).toBeVisible();
    await expect(page.getByText("Password minimal 6 karakter")).toBeVisible();
  });

  test("shows password mismatch error", async ({ page }) => {
    await page.goto("/register");

    await page.getByLabel("Nama Lengkap").fill("Budi Santoso");
    await page.getByLabel("Email").fill("budi@example.com");
    await page.locator("#password").fill("password123");
    await page.locator("#confirmPassword").fill("password321");
    await page.getByRole("button", { name: "Daftar" }).click();

    await expect(page.getByText("Password tidak cocok")).toBeVisible();
  });
});
