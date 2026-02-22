import { expect, test } from "@playwright/test";

test.describe("Auth critical path", () => {
  test("navigates from landing page to login page", async ({ page }) => {
    await page.goto("/");

    const masukButton = page.getByRole("button", { name: "Masuk" }).first();
    await expect(masukButton).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/login$/, { timeout: 15000 }),
      masukButton.click(),
    ]);

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText("Masukan detail Anda untuk Login")).toBeVisible();
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  });

  test("shows validation messages on empty login submit", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByText("Email tidak valid")).toBeVisible();
    await expect(page.getByText("Password wajib diisi")).toBeVisible();
  });
});
