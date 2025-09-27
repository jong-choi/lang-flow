import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Divider, DividerLabel } from "@/components/ui/divider";
import { GoogleLoginButton } from "@/features/auth/components/google-login-button";
import { StartGuestButton } from "@/features/auth/components/start-guest-button";
import { FeatureItem } from "@/features/auth/components/ui/auth-icons";

export default async function SignInPage() {
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
                로그인하고 워크스페이스로 돌아오세요
              </h1>
              <p className="text-base leading-relaxed text-muted-foreground">
                Google 계정으로 로그인하거나, 게스트 모드로 즉시 워크스페이스를
                체험해보세요.
              </p>
            </div>
          </div>
          <div className="grid gap-4 text-sm text-muted-foreground">
            <FeatureItem
              title="Google OAuth"
              description="OAuth 2.0 기반 소셜 로그인으로 빠른 진입"
            />
            <FeatureItem
              title="Guest Mode"
              description="회원가입 없이 게스트 계정으로 즉시 시작"
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
              게스트 모드로 바로 시작하거나 Google 계정으로 로그인할 수 있어요.
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            <Suspense>
              <StartGuestButton className="w-full" size="lg" />
              <Divider>
                <DividerLabel>or continue with</DividerLabel>
              </Divider>
              <GoogleLoginButton />
            </Suspense>
            <p className="text-center text-xs text-muted-foreground">
              로그인 시 서비스 약관과 개인정보 처리방침에 동의하게 됩니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
