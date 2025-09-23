import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStoreStore } from "@/features/store/providers/store-store-provider";
import { buildCartSnapshot } from "@/features/store/stores/slices/cart-slice";
import { CartEmptyState } from "./cart-empty";
import { CartItem } from "./cart-item";
import { CartSummary } from "./cart-summary";

export function CartPage() {
  const cartItems = useStoreStore.use.cartItems();
  const templates = useStoreStore.use.templates();
  const cartSnapshot = useMemo(
    () => buildCartSnapshot(cartItems, templates),
    [cartItems, templates],
  );
  const clearCart = useStoreStore.use.clearCart();

  if (cartSnapshot.totalItems === 0) {
    return <CartEmptyState />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/store">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              스토어로 돌아가기
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">장바구니</h1>
          <Badge variant="secondary" className="px-3 py-1">
            {cartSnapshot.totalItems}개 항목
          </Badge>
        </div>

        <Button
          variant="outline"
          onClick={() => clearCart()}
          className="text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          전체 삭제
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-4">
          {cartSnapshot.items.map((item) => (
            <CartItem key={item.templateId} templateId={item.templateId} />
          ))}
        </div>

        <div className="lg:col-span-1">
          <CartSummary />
        </div>
      </div>
    </div>
  );
}
