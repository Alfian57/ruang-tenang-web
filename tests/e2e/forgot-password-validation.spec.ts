import { expect, test } from "@playwright/test";

test.describe("Forgot password validation", () => {
  test("shows invalid email message", async ({ page }) => {
    await page.goto("/forgot-password");

    await page.getByRole("button", { name: "Kirim Link Reset" }).click();

    await expect(page.getByText("Email tidak valid")).toBeVisible();
  });
});
