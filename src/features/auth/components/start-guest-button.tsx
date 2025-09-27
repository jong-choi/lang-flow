"use client";

import { type ComponentProps, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export type StartGuestButtonProps = Omit<
  ComponentProps<typeof Button>,
  "onClick" | "onError"
> & {
  onError?: (message: string | null) => void;
  onSuccess?: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
  label?: string;
  loadingLabel?: string;
  successMessage?: string;
};

export function StartGuestButton({
  onError,
  onSuccess,
  onLoadingChange,
  label = "게스트 모드로 시작하기",
  loadingLabel = "게스트 계정 생성 중...",
  successMessage = "게스트 모드로 시작했어요. 서비스를 바로 이용해보세요!",
  disabled,
  className,
  ...buttonProps
}: StartGuestButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const setLoading = (value: boolean) => {
    setIsLoading(value);
    onLoadingChange?.(value);
  };

  const handleStart = async () => {
    if (isLoading) return;

    setLoading(true);
    onError?.(null);

    try {
      const response = await fetch("/api/auth/guest/start", {
        method: "POST",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        const message = data?.error ?? "게스트 모드를 시작할 수 없습니다.";
        onError?.(message);
        toast.error(message);
        return;
      }

      toast.success(successMessage);
      onSuccess?.();
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      console.error("startGuest request failed", error);
      const message =
        "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      onError?.(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      {...buttonProps}
      className={className}
      disabled={disabled || isLoading}
      onClick={(event) => {
        event.preventDefault();
        handleStart();
      }}
    >
      <span className="flex items-center justify-center gap-2">
        {isLoading && <Loader2 className="size-4 animate-spin" />}
        {isLoading ? loadingLabel : label}
      </span>
    </Button>
  );
}
