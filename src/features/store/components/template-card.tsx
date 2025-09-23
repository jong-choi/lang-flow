import Image from "next/image";
import { Crown, Plus, ShoppingCart, Star, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { WorkflowTemplate } from "@/types/store";
import { cn } from "@/utils/cn";

interface TemplateCardProps {
  template: WorkflowTemplate;
  onPurchase: (template: WorkflowTemplate) => void;
  onViewDetails: (template: WorkflowTemplate) => void;
  onAddToCart?: (template: WorkflowTemplate) => void;
  isInCart?: boolean;
}

export function TemplateCard({
  template,
  onPurchase,
  onViewDetails,
  onAddToCart,
  isInCart = false,
}: TemplateCardProps) {
  const handlePurchase = (event: React.MouseEvent) => {
    event.stopPropagation();
    onPurchase(template);
  };

  const handleAddToCart = (event: React.MouseEvent) => {
    event.stopPropagation();
    onAddToCart?.(template);
  };

  return (
    <Card
      className="group relative cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
      onClick={() => onViewDetails(template)}
    >
      {/* 특별 표시 배지 */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        {template.isFeatured && (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Crown className="w-3 h-3 mr-1" />
            추천
          </Badge>
        )}
        {template.isPopular && (
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <TrendingUp className="w-3 h-3 mr-1" />
            인기
          </Badge>
        )}
      </div>

      <div className="p-6">
        {/* 카테고리와 가격 */}
        <div className="flex items-center justify-between mb-3">
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

        {/* 제목 */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {template.title}
        </h3>

        {/* 설명 */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {template.description}
        </p>

        {/* 평점과 리뷰 */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{template.rating}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            ({template.reviewCount}개 리뷰)
          </span>
        </div>

        {/* 작성자 정보 */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full overflow-hidden relative">
            {template.author.avatar ? (
              <Image
                src={template.author.avatar}
                alt={template.author.name}
                fill
                className="object-cover"
                sizes="24px"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs">
                {template.author.name.charAt(0)}
              </div>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {template.author.name}
          </span>
        </div>

        {/* 태그 */}
        <div className="flex flex-wrap gap-1 mb-4">
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

        {/* 구매 버튼들 */}
        <div className="space-y-2">
          {/* 장바구니 버튼 */}
          {onAddToCart && !template.isPurchased && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleAddToCart}
              disabled={isInCart}
            >
              {isInCart ? (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  장바구니에 담김
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  장바구니 담기
                </>
              )}
            </Button>
          )}

          {/* 구매 버튼 */}
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
                <Crown className="w-4 h-4 mr-2" />
                구매완료
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
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
