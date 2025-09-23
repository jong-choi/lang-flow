import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CartEmptyState() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/store">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            스토어로 돌아가기
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">장바구니</h1>
      </div>

      <div className="text-center py-16">
        <div className="text-6xl mb-4">🛒</div>
        <h3 className="text-xl font-semibold mb-2">장바구니가 비어있습니다</h3>
        <p className="text-muted-foreground mb-6">
          원하는 워크플로우 템플릿을 장바구니에 담아보세요.
        </p>
        <Link href="/store">
          <Button>
            <ShoppingCart className="w-4 h-4 mr-2" />
            스토어 둘러보기
          </Button>
        </Link>
      </div>
    </div>
  );
}
