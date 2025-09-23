"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AuthAlert } from "@/features/auth/components/ui/auth-alert";
import {
  FeatureItem,
  GoogleIcon,
} from "@/features/auth/components/ui/auth-icons";
import {
  type SignInFormValues,
  signInSchema,
} from "@/features/auth/types/forms";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const registered = searchParams.has("registered");

  const [oauthLoading, setOauthLoading] = useState(false);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleCredentialsSignIn = async (values: SignInFormValues) => {
    form.clearErrors("root");

    try {
      const response = await fetch("/api/auth/login-with-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        const message = data?.error ?? "로그인에 실패했습니다.";
        form.setError("root", { message });
        toast.error(message);
        return;
      }

      toast.success("로그인에 성공했습니다.");
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      console.error("loginWithPassword request failed", err);
      const message =
        "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      form.setError("root", { message });
      toast.error(message);
    }
  };

  const handleGoogle = async () => {
    form.clearErrors("root");
    setOauthLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } finally {
      setOauthLoading(false);
    }
  };

  const onSubmit = form.handleSubmit(handleCredentialsSignIn);
  const isSubmitting = form.formState.isSubmitting;
  const isGoogleLoading = oauthLoading;
  const isLoading = isSubmitting || isGoogleLoading;
  const rootError = form.formState.errors.root?.message ?? null;

  return (
    <div className="relative isolate overflow-hidden py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 select-none">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -right-24 -bottom-48 h-[360px] w-[360px] rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute top-1/2 -left-24 h-[320px] w-[320px] -translate-y-1/2 rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 rounded-3xl border border-border/60 bg-background/90 p-6 shadow-2xl shadow-primary/10 backdrop-blur-xl md:grid-cols-[1.1fr_1fr] md:p-12 lg:gap-16">
        <section className="flex flex-col justify-between gap-8">
          <div className="space-y-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              seamless access
            </span>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                하나의 계정으로 팀의 모든 워크플로우에 접속하세요
              </h1>
              <p className="text-base leading-relaxed text-muted-foreground">
                Google OAuth와 이메일/비밀번호 로그인을 동시에 지원합니다.
                안정적인 세션 관리와 세련된 UI로 고객에게 최고의 경험을
                제공하세요.
              </p>
            </div>
          </div>
          <div className="grid gap-4 text-sm text-muted-foreground">
            <FeatureItem
              title="Google OAuth"
              description="OAuth 2.0 기반 소셜 로그인으로 빠른 진입"
            />
            <FeatureItem
              title="Credentials"
              description="이메일/비밀번호 로그인과 회원가입 API 완비"
            />
            <FeatureItem
              title="보안 강화"
              description="bcrypt 해시 + NextAuth 세션 콜백 구성"
            />
          </div>
        </section>

        <Card className="border-none bg-background/95 shadow-lg shadow-primary/10">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold">로그인</CardTitle>
            <p className="text-sm text-muted-foreground">
              계정을 입력하고 바로 워크스페이스로 이동하세요.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {registered && (
              <AuthAlert tone="success">
                회원가입이 완료되었습니다. 이제 로그인해주세요.
              </AuthAlert>
            )}
            {rootError && <AuthAlert tone="error">{rootError}</AuthAlert>}

            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이메일</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between text-sm">
                        <FormLabel>비밀번호</FormLabel>
                        <Link
                          href="/auth/signup"
                          className="text-xs text-primary hover:text-primary/80"
                        >
                          계정이 없으신가요?
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="current-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      로그인 중...
                    </span>
                  ) : (
                    "이메일로 로그인"
                  )}
                </Button>
              </form>
            </Form>

            <div className="relative py-2 text-center text-xs tracking-[0.3em] text-muted-foreground uppercase">
              <span className="absolute top-1/2 left-0 block h-px w-full -translate-y-1/2 bg-border" />
              <span className="relative bg-background px-3">
                or continue with
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogle}
              disabled={isLoading}
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

            <p className="text-center text-xs text-muted-foreground">
              로그인 시 서비스 약관과 개인정보 처리방침에 동의하게 됩니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
