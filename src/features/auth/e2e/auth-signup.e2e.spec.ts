import { randomUUID } from "crypto";
import { expect, test } from "@playwright/test";

const adminUser = {
  email: "admin@admin.com",
  password: "admin1234",
};

const messages = {
  duplicateEmail: "이미 사용 중인 이메일입니다",
  registrationSuccess: "회원가입이 완료되었습니다. 이제 로그인해주세요.",
  emailInvalid: "이메일 형식이 올바르지 않습니다.",
  passwordTooShort: "비밀번호는 최소 8자 이상이어야 합니다.",
  nameRequired: "이름을 입력해주세요.",
};

test.describe("이메일 회원가입 플로우", () => {
  test.beforeEach(async ({ page }) => {
    const logoutButton = page.getByRole("button", { name: "로그아웃" });
    if (await logoutButton.isVisible().catch(() => false)) {
      await logoutButton.click();
      await page.waitForURL("/");
    }
    await page.goto("/auth/signup");
  });
  test("회원가입 페이지가 올바르게 렌더링된다", async ({ page }) => {
    await expect(page.getByText("회원가입").first()).toBeVisible();
    await expect(page.getByLabel("이름")).toBeVisible();
    await expect(page.getByLabel("이메일")).toBeVisible();
    await expect(page.getByLabel("비밀번호")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "계정 생성하기" }),
    ).toBeVisible();
  });

  test("새로운 계정을 생성하면 로그인 페이지로 이동한다", async ({ page }) => {
    const uniqueEmail = `playwright-${randomUUID()}@example.com`;

    await page.getByLabel("이름").fill("플레이라이트 사용자");
    await page.getByLabel("이메일").fill(uniqueEmail);
    await page.getByLabel("비밀번호").fill("testpass123");

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/auth/sign-up") &&
        response.request().method() === "POST" &&
        response.status() === 201,
    );
    const navigationPromise = page.waitForURL(/\/auth\/signin\?registered=1$/);

    await page.getByRole("button", { name: "계정 생성하기" }).click();

    await responsePromise;
    await navigationPromise;

    await expect(page).toHaveURL(/\/auth\/signin\?registered=1$/);
    await expect(page.getByText(messages.registrationSuccess)).toBeVisible();
  });

  test("이미 존재하는 이메일로 회원가입하면 오류 메시지가 노출된다", async ({
    page,
  }) => {
    await page.getByLabel("이름").fill("관리자");
    await page.getByLabel("이메일").fill(adminUser.email);
    await page.getByLabel("비밀번호").fill(adminUser.password);
    await page.getByRole("button", { name: "계정 생성하기" }).click();

    await expect(page.getByText(messages.duplicateEmail).first()).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/signup$/);
  });

  test("입력값이 유효하지 않으면 검증 메시지가 노출된다", async ({ page }) => {
    await page.goto("/auth/signup");

    await page.getByRole("button", { name: "계정 생성하기" }).click();

    await expect(page.getByText(messages.nameRequired)).toBeVisible();
    await expect(page.getByText(messages.emailInvalid)).toBeVisible();
    await expect(page.getByText(messages.passwordTooShort)).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/signup$/);
  });
});
