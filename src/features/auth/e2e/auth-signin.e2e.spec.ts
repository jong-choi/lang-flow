import { expect, test } from "@playwright/test";

const adminUser = {
  email: "admin@admin.com",
  password: "admin1234",
  name: "관리자",
};

const errorMessage = "이메일 또는 비밀번호를 확인해주세요.";

const emailValidationMessage = "이메일 형식이 올바르지 않습니다.";
const passwordValidationMessage = "비밀번호는 최소 8자 이상이어야 합니다.";

test.describe("이메일 로그인 플로우", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    const logoutButton = page.getByRole("button", { name: "로그아웃" }).first();
    if (await logoutButton.isVisible().catch(() => false)) {
      await logoutButton.click();
      await page.waitForURL("/");
    }
  });
  test("로그아웃 상태에서는 로그인 및 회원가입 버튼이 노출된다", async ({
    page,
  }) => {
    await expect(page.getByRole("link", { name: "로그인" })).toBeVisible();
    await expect(page.getByRole("link", { name: "회원가입" })).toBeVisible();
  });

  test("올바른 자격 증명으로 로그인하면 홈 화면으로 이동한다", async ({
    page,
  }) => {
    await page.goto("/auth/signin");

    await page.getByLabel("이메일").fill(adminUser.email);
    await page.getByLabel("비밀번호").fill(adminUser.password);

    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/api/auth/login-with-password") &&
          response.request().method() === "POST" &&
          response.status() === 200,
      ),
      page.getByRole("button", { name: "이메일로 로그인" }).first().click(),
    ]);

    await expect(page).toHaveURL(/\/$/);

    await expect(
      page.getByRole("button", { name: "로그아웃" }).first(),
    ).toBeVisible();
    await expect(
      page.locator("header").getByRole("link", { name: "로그인" }),
    ).toHaveCount(0);
    await expect(
      page.locator("header").getByRole("link", { name: "회원가입" }),
    ).toHaveCount(0);
    await expect(
      page.locator("header").getByText(adminUser.email, { exact: true }),
    ).toBeVisible();
  });

  test("잘못된 자격 증명으로 로그인하면 오류 메시지가 노출된다", async ({
    page,
  }) => {
    await page.goto("/auth/signin");

    await page.getByLabel("이메일").fill(adminUser.email);
    await page.getByLabel("비밀번호").fill("wrong-password");
    await page.getByRole("button", { name: "이메일로 로그인" }).click();

    await expect(page).toHaveURL(/\/auth\/signin$/);
    await expect(page.getByText(errorMessage).first()).toBeVisible();
  });

  test("필수 입력값이 비어 있으면 폼 검증 메시지가 노출된다", async ({
    page,
  }) => {
    await page.goto("/auth/signin");

    await page.getByRole("button", { name: "이메일로 로그인" }).click();

    await expect(page.getByText(emailValidationMessage).first()).toBeVisible();
    await expect(
      page.getByText(passwordValidationMessage).first(),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/signin$/);
  });
});
