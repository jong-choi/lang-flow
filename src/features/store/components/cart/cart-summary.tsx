import { useMemo } from "react";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStoreStore } from "@/features/store/providers/store-store-provider";
import { buildCartSnapshot } from "@/features/store/stores/slices/cart-slice";

const CURRENT_CREDITS = 15;

export function CartSummary() {
  const cartItems = useStoreStore.use.cartItems();
  const templates = useStoreStore.use.templates();
  const cartSnapshot = useMemo(
    () => buildCartSnapshot(cartItems, templates),
    [cartItems, templates],
  );
  const openPurchaseDialog = useStoreStore.use.openPurchaseDialog();

  const isAffordable = CURRENT_CREDITS >= cartSnapshot.totalPrice;

  const handleCheckout = () => {
    const templateIds = cartSnapshot.items.map((item) => item.templateId);
    if (templateIds.length > 0) {
      openPurchaseDialog(templateIds);
    }
  };

  return (
    <Card className="sticky top-24 p-6">
      <h3 className="mb-6 text-xl font-semibold">결제 요약</h3>

      <div className="mb-6 space-y-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            템플릿 {cartSnapshot.totalItems}개
          </span>
          <span className="font-medium">{cartSnapshot.totalPrice} 크레딧</span>
        </div>

        <hr />

        <div className="flex justify-between text-lg font-semibold">
          <span>총 결제 금액</span>
          <span className="text-primary">{cartSnapshot.totalPrice} 크레딧</span>
        </div>
      </div>

      <div className="mb-6 space-y-2 rounded-lg bg-muted p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">보유 크레딧:</span>
          <span className="font-medium">{CURRENT_CREDITS} 크레딧</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">결제 후 잔액:</span>
          <span
            className={`font-medium ${isAffordable ? "text-green-600" : "text-red-600"}`}
          >
            {CURRENT_CREDITS - cartSnapshot.totalPrice} 크레딧
          </span>
        </div>
      </div>

      {!isAffordable && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="space-y-1 text-sm text-red-600">
            <p className="font-medium">크레딧이 부족합니다</p>
            <p>
              {cartSnapshot.totalPrice - CURRENT_CREDITS}
              개의 크레딧이 더 필요합니다.
            </p>
          </div>
        </div>
      )}

      <Button
        className="w-full"
        disabled={!isAffordable}
        onClick={handleCheckout}
      >
        <CreditCard className="mr-2 h-4 w-4" />
        {cartSnapshot.totalPrice} 크레딧으로 결제
      </Button>

      <Link href="/store" className="mt-4 block">
        <Button variant="outline" className="w-full">
          계속 쇼핑하기
        </Button>
      </Link>
    </Card>
  );
}
