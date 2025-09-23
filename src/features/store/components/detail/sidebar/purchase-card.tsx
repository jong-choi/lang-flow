import { Download, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTemplateById } from "@/features/store/hooks/use-template-by-id";
import { useStoreStore } from "@/features/store/providers/store-store-provider";

interface PurchaseCardProps {
  templateId: string;
}

export function PurchaseCard({ templateId }: PurchaseCardProps) {
  const template = useTemplateById(templateId);
  const addToCart = useStoreStore.use.addToCart();
  const isInCart = useStoreStore.use.cartItems((items) =>
    items.some((item) => item.templateId === templateId),
  );
  const openPurchaseDialog = useStoreStore.use.openPurchaseDialog();

  if (!template) {
    return null;
  }

  const handleAddToCart = () => {
    const result = addToCart(templateId);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handlePurchase = () => {
    openPurchaseDialog([templateId]);
  };

  return (
    <Card className="space-y-4 p-6">
      <div className="text-center">
        <div className="mb-2 text-3xl font-bold text-primary">
          {template.price} 크레딧
        </div>
        {template.price > 0 && (
          <p className="text-sm text-muted-foreground">일회성 구매</p>
        )}
      </div>

      {!template.isPurchased && (
        <Button
          variant="outline"
          className="w-full"
          onClick={handleAddToCart}
          disabled={isInCart}
        >
          {isInCart ? (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              장바구니에 담김
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              장바구니 담기
            </>
          )}
        </Button>
      )}

      <Button
        className="w-full"
        onClick={handlePurchase}
        disabled={template.isPurchased}
      >
        {template.isPurchased ? (
          <>구매완료</>
        ) : template.price > 0 ? (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            구매하기
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            무료 다운로드
          </>
        )}
      </Button>
    </Card>
  );
}
