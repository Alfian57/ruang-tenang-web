import { expect, test } from "@playwright/test";

test("login shows invalid email error", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill("invalid-email");
  await page.locator("#password").fill("password");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByText("Email tidak valid")).toBeVisible();
});
