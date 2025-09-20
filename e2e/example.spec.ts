import { expect, test } from "@playwright/test";

test.describe("Example Domain", () => {
  test("제목과 본문을 검증한다", async ({ page }) => {
    await page.goto("https://example.com");
    await expect(page).toHaveTitle("Example Domain");
    await expect(page.locator("body")).toContainText("illustrative examples");
  });

  test("링크 전환을 검증한다", async ({ page }) => {
    await page.goto("https://example.com");
    await page.getByRole("link", { name: "More information..." }).click();
    await expect(page).toHaveURL(/iana\.org/);
  });
});
