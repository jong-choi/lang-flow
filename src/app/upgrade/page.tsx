import { redirect } from "next/navigation";
import { UpgradeContent } from "@/app/upgrade/upgrade-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthAlert } from "@/features/auth/components/ui/auth-alert";
import { auth } from "@/features/auth/lib/auth";

export default async function UpgradePage() {
  const session = await auth();

  if (!session?.user) {
    const callback = encodeURIComponent("/auth/upgrade");
    redirect(`/auth/signin?callbackUrl=${callback}`);
  }

  const isGuest = session.user.email?.startsWith("guest@") ?? false;
  const displayName = session.user.name ?? session.user.email ?? "게스트";

  return (
    <div className="relative isolate overflow-hidden py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 select-none">
        <div className="absolute -top-32 left-1/2 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute right-12 -bottom-40 h-[340px] w-[340px] rounded-full bg-sky-400/20 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-3xl flex-col gap-8 rounded-3xl border border-border/60 bg-background/92 p-6 shadow-2xl shadow-primary/10 backdrop-blur-xl md:p-12">
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            link account
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {displayName}님, Google 계정과 연동해보세요
          </h1>
          <p className="text-base text-muted-foreground">
            Google 계정을 연결하면 워크스페이스와 사용 중인 데이터를 그대로
            유지한 채로 Google 프로필을 사용할 수 있어요.
          </p>
        </div>

        {!isGuest && (
          <AuthAlert tone="error">
            이미 정식 회원으로 로그인되어 있습니다. 다른 계정으로 전환하려면
            먼저 로그아웃해주세요.
          </AuthAlert>
        )}

        <Card className="border-none bg-background/95 shadow-lg shadow-primary/10">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Google 계정으로 연동하기
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UpgradeContent isGuest={isGuest} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
