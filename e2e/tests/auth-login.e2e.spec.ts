import { expect, test } from "@playwright/test";

const adminUser = {
  email: "admin@admin.com",
  password: "admin1234",
  name: "관리자",
};

test.describe("이메일 로그인 플로우", () => {
  test("홈에서 로그인 후 헤더에 이메일이 표시된다", async ({ page }) => {
    await page.goto("/");

    const loginLink = page.getByRole("link", { name: "로그인" });
    await expect(loginLink).toBeVisible();

    await loginLink.click();
    await expect(page).toHaveURL(/\/auth\/signin$/);

    await page.getByLabel("이메일").fill(adminUser.email);
    await page.getByLabel("비밀번호").fill(adminUser.password);

    await Promise.all([
      page.waitForURL("**/", { timeout: 1_000 }),
      page.getByRole("button", { name: "이메일로 로그인" }).click(),
    ]);

    await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();
    await expect(page.locator("header")).toContainText(adminUser.email);
  });
});

test("이메일을 입력하지 않고 로그인 시도 시 유효성 검사 에러가 발생한다", async ({
  page,
}) => {
  await page.goto("/auth/signin");

  await page.getByLabel("비밀번호").fill("password123");

  await page.getByRole("button", { name: "이메일로 로그인" }).click();

  await expect(page.getByLabel("이메일")).toBeFocused();
});

test("비밀번호를 입력하지 않고 로그인 시도 시 유효성 검사 에러가 발생한다", async ({
  page,
}) => {
  await page.goto("/auth/signin");

  await page.getByLabel("이메일").fill("test@example.com");

  await page.getByRole("button", { name: "이메일로 로그인" }).click();

  await expect(page.getByLabel("비밀번호")).toBeFocused();
});

test("존재하지 않는 이메일로 로그인 시도 시 에러메시지가 표시된다", async ({
  page,
}) => {
  await page.goto("/auth/signin");

  await page.getByLabel("이메일").fill("nonexistent@example.com");
  await page.getByLabel("비밀번호").fill("password123");

  await page.getByRole("button", { name: "이메일로 로그인" }).click();

  await expect(
    page.getByRole("main").getByText("이메일 또는 비밀번호를 확인해주세요."),
  ).toBeVisible();
});

test("잘못된 비밀번호로 로그인 시도 시 에러메시지가 표시된다", async ({
  page,
}) => {
  await page.goto("/auth/signin");

  await page.getByLabel("이메일").fill(adminUser.email);
  await page.getByLabel("비밀번호").fill("wrongpassword");

  await page.getByRole("button", { name: "이메일로 로그인" }).click();

  await expect(
    page.getByRole("main").getByText("이메일 또는 비밀번호를 확인해주세요."),
  ).toBeVisible();
});

test.describe("로그인된 상태에서 인증 페이지 접근 시 리다이렉트", () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 로그인 수행
    await page.goto("/auth/signin");
    await page.getByLabel("이메일").fill(adminUser.email);
    await page.getByLabel("비밀번호").fill(adminUser.password);

    await Promise.all([
      page.waitForURL("**/", { timeout: 1_000 }),
      page.getByRole("button", { name: "이메일로 로그인" }).click(),
    ]);

    // 로그인 성공 확인
    await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();
  });

  test("로그인된 상태에서 signin 페이지 접근 시 홈으로 리다이렉트된다", async ({
    page,
  }) => {
    await page.goto("/auth/signin");

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();
  });

  test("로그인된 상태에서 signup 페이지 접근 시 홈으로 리다이렉트된다", async ({
    page,
  }) => {
    await page.goto("/auth/signup");

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();
  });
});
