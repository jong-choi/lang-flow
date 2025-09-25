import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CartEmptyState() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/store">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            스토어로 돌아가기
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">장바구니</h1>
      </div>

      <div className="py-16 text-center">
        <div className="mb-4 text-6xl">🛒</div>
        <h3 className="mb-2 text-xl font-semibold">장바구니가 비어있습니다</h3>
        <p className="mb-6 text-muted-foreground">
          원하는 워크플로우 템플릿을 장바구니에 담아보세요.
        </p>
        <Link href="/store">
          <Button>
            <ShoppingCart className="mr-2 h-4 w-4" />
            스토어 둘러보기
          </Button>
        </Link>
      </div>
    </div>
  );
}
