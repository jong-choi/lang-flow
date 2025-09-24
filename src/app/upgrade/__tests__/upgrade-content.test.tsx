import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UpgradeContent } from "@/app/upgrade/upgrade-content";

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

describe("UpgradeContent", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to Google sign-in for guest accounts", async () => {
    const { signIn } = await import("next-auth/react");

    render(<UpgradeContent isGuest />);

    const button = screen.getByRole("button", {
      name: "Google 계정 연동하기",
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("google", { callbackUrl: "/" });
    });
  });

  it("blocks upgrade action for non-guest accounts", async () => {
    const { signIn } = await import("next-auth/react");

    render(<UpgradeContent isGuest={false} />);

    expect(
      screen.getByText(
        "게스트 계정이 아닌 상태에서는 회원 전환을 진행할 수 없습니다.",
      ),
    ).toBeInTheDocument();

    expect(signIn).not.toHaveBeenCalled();
  });
});
