"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { AuthAlert } from "@/features/auth/components/ui/auth-alert";
import { GoogleIcon } from "@/features/auth/components/ui/auth-icons";

type UpgradeContentProps = {
  isGuest: boolean;
};

export function UpgradeContent({ isGuest }: UpgradeContentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    if (!isGuest) return;
    setIsLoading(true);
    setError(null);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (err) {
      console.error("upgrade sign-in failed", err);
      setError(
        "Google 계정 연동을 진행할 수 없습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isGuest) {
    return (
      <AuthAlert tone="error">
        게스트 계정이 아닌 상태에서는 회원 전환을 진행할 수 없습니다.
      </AuthAlert>
    );
  }

  return (
    <div className="space-y-4">
      {error && <AuthAlert tone="error">{error}</AuthAlert>}
      <p className="text-sm leading-relaxed text-muted-foreground">
        Google 계정을 연동하면 이후부터 모든 기기에서 Google 프로필과 함께
        동일한 워크스페이스를 사용할 수 있습니다.
      </p>
      <Button
        className="w-full"
        size="lg"
        variant="default"
        onClick={handleUpgrade}
        disabled={isLoading}
      >
        <span className="flex items-center justify-center gap-2">
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <GoogleIcon className="size-4" />
          )}
          {isLoading ? "Google 연동 중..." : "Google 계정 연동하기"}
        </span>
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        이미 연동된 계정이라면 Google로 로그인하면 바로 워크스페이스를 이어서
        사용할 수 있어요.
      </p>
    </div>
  );
}
