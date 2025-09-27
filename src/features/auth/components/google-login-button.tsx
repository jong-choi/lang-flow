"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/features/auth/components/ui/auth-icons";

export function GoogleLoginButton() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [oauthLoading, setOauthLoading] = useState(false);
  const isGoogleLoading = oauthLoading;

  const handleGoogle = async () => {
    setOauthLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } finally {
      setOauthLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogle}
      disabled={isGoogleLoading}
      className="w-full"
    >
      <span className="flex items-center justify-center gap-2">
        {isGoogleLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <GoogleIcon className="size-4" />
        )}
        Google로 로그인
      </span>
    </Button>
  );
}
