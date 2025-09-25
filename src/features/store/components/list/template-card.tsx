"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Crown, Plus, ShoppingCart, Star, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTemplateById } from "@/features/store/hooks/use-template-by-id";
import { useStoreStore } from "@/features/store/providers/store-store-provider";
import { cn } from "@/utils/cn";

interface TemplateCardProps {
  templateId: string;
}

export function TemplateCard({ templateId }: TemplateCardProps) {
  const router = useRouter();
  const template = useTemplateById(templateId);
  const openPurchaseDialog = useStoreStore.use.openPurchaseDialog();
  const addToCart = useStoreStore.use.addToCart();
  const isInCart = useStoreStore.use.cartItems((items) =>
    items.some((item) => item.templateId === templateId),
  );
  const setSelectedTemplateId = useStoreStore.use.setSelectedTemplateId();

  if (!template) {
    return null;
  }

  const handleViewDetails = () => {
    setSelectedTemplateId(templateId);
    router.push(`/store/${templateId}`);
  };

  const handlePurchase = (event: React.MouseEvent) => {
    event.stopPropagation();
    openPurchaseDialog([templateId]);
  };

  const handleAddToCart = (event: React.MouseEvent) => {
    event.stopPropagation();
    const result = addToCart(templateId);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Card
      className="group relative cursor-pointer overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
      onClick={handleViewDetails}
    >
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        {template.isFeatured && (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Crown className="mr-1 h-3 w-3" />
            추천
          </Badge>
        )}
        {template.isPopular && (
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <TrendingUp className="mr-1 h-3 w-3" />
            인기
          </Badge>
        )}
      </div>

      <div className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {template.category}
          </Badge>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-primary">
              {template.price}
            </span>
            <span className="text-sm text-muted-foreground">크레딧</span>
          </div>
        </div>

        <h3 className="mb-2 line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary">
          {template.title}
        </h3>

        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
          {template.description}
        </p>

        <div className="mb-4 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{template.rating}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            ({template.reviewCount}개 리뷰)
          </span>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <div className="relative h-6 w-6 overflow-hidden rounded-full">
            {template.author.avatar ? (
              <Image
                src={template.author.avatar}
                alt={template.author.name}
                fill
                className="object-cover"
                sizes="24px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xs">
                {template.author.name.charAt(0)}
              </div>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {template.author.name}
          </span>
        </div>

        <div className="mb-4 flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{template.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          {!template.isPurchased && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleAddToCart}
              disabled={isInCart}
            >
              {isInCart ? (
                <>
                  <Crown className="mr-2 h-4 w-4" />
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
            className={cn(
              "w-full transition-all",
              template.isPurchased
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-primary hover:bg-primary/90",
            )}
            onClick={handlePurchase}
            disabled={template.isPurchased}
          >
            {template.isPurchased ? (
              <>
                <Crown className="mr-2 h-4 w-4" />
                구매완료
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                {template.price > 0
                  ? `${template.price} 크레딧으로 구매`
                  : "무료 다운로드"}
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
