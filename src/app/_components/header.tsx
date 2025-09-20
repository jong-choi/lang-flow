import { Suspense } from "react";
import { HeaderContainer, HeaderNav, Logo } from "@/components/ui/site-header";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthControls } from "@/features/auth/components/auth-controls";

export function MainHeader() {
  return (
    <HeaderContainer>
      <div className="flex items-center gap-6">
        <Logo />
        <HeaderNav />
      </div>
      <Suspense fallback={<Skeleton className="h-9 w-28" />}>
        <AuthControls />
      </Suspense>
    </HeaderContainer>
  );
}
