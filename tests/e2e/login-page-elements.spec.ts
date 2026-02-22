import { expect, test } from "@playwright/test";

test("login page shows main form elements", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByText("Masukan detail Anda untuk Login")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.locator("#password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
});
