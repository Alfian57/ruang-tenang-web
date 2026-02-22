import { expect, test } from "@playwright/test";

test("landing shows auth entry buttons", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: "Masuk" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Daftar" }).first()).toBeVisible();
});
