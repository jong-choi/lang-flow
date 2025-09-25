import Link from "next/link";
import { CircleUserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { UserCreditBadge } from "@/features/auth/components/user-credit-badge";
import { auth } from "@/features/auth/lib/auth";

export async function AuthControls() {
  const session = await auth(); //서버사이드 렌더링

  if (session?.user) {
    const isGuest = session.user.email?.startsWith("guest@") ?? false;
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 truncate">
          {session.user.image ? (
            // 사용자별 이미지 주소가 서로 다를 수 있어 일반 img 태그로 치환합니다.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={session.user.name ?? session.user.email ?? "사용자"}
              width={36}
              height={36}
              className="rounded-full border border-border object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex size-9 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
              <CircleUserRound className="size-5" />
            </div>
          )}
          <div className="hidden leading-tight md:block">
            <p className="truncate text-sm font-medium text-foreground">
              {session.user.name ?? session.user.email}
            </p>
            {session.user.email && (
              <p className="truncate text-xs text-muted-foreground">
                {session.user.email}
              </p>
            )}
          </div>
        </div>
        <UserCreditBadge userId={session.user.id} />
        {isGuest && (
          <Button variant="default" size="sm" asChild>
            <Link href="/upgrade">Google 연동</Link>
          </Button>
        )}
        <LogoutButton />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" asChild>
        <Link href="/auth/signin">로그인</Link>
      </Button>
    </div>
  );
}
