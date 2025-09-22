import { expect, test } from "@playwright/test";

test.describe("플로우 빌더 생성 페이지", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/flow/generate");
  });

  test("사이드바 팔레트와 실행 컨트롤을 표시합니다", async ({ page }) => {
    await expect(page.getByText("드래그하여 노드 추가")).toBeVisible();
    await expect(page.getByText("조작 방법")).toBeVisible();
    await expect(page.getByText("채팅 노드")).toBeVisible();

    const startButton = page.getByRole("button", { name: "시작" });
    await expect(startButton).toBeDisabled();
    await expect(page.getByRole("button", { name: "중단" })).toBeDisabled();

    const canvas = page.locator(".react-flow").first();
    await expect(canvas.getByText("입력 노드")).toBeVisible();
  });

  test("팔레트에서 캔버스로 새 노드를 드래그할 수 있습니다", async ({
    page,
  }) => {
    const paletteItem = page.getByText("채팅 노드").first();
    const canvas = page.locator(".react-flow").first();
    await expect(canvas).toBeVisible();

    await paletteItem.dragTo(canvas, { targetPosition: { x: 250, y: 200 } });

    await expect(canvas.getByText("채팅 노드")).toBeVisible();
  });
});
