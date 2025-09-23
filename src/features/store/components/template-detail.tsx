import Image from "next/image";
import {
  ArrowLeft,
  Crown,
  Download,
  Flag,
  Heart,
  Plus,
  Share2,
  ShoppingCart,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/features/store/hooks/use-cart";
import type { WorkflowTemplate } from "@/types/store";

interface TemplateDetailProps {
  template: WorkflowTemplate;
  onBack: () => void;
  onPurchase: (template: WorkflowTemplate) => void;
}

export function TemplateDetail({
  template,
  onBack,
  onPurchase,
}: TemplateDetailProps) {
  const { addToCart, isInCart } = useCart();

  const handlePurchase = () => {
    onPurchase(template);
  };

  const handleAddToCart = () => {
    const result = addToCart(template);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 뒤로가기 버튼 */}
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        스토어로 돌아가기
      </Button>

      {/* 2단형 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 메인 컨텐츠 (3/4) */}
        <div className="lg:col-span-3 space-y-6">
          {/* 헤더 */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{template.category}</Badge>
                  {template.isFeatured && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      추천
                    </Badge>
                  )}
                  {template.isPopular && (
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      인기
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-2">{template.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{template.rating}</span>
                    <span>({template.reviewCount}개 리뷰)</span>
                  </div>
                  <span>•</span>
                  <span>{template.createdAt}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Flag className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* 설명 */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">템플릿 설명</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {template.description}
            </p>

            <div>
              <h3 className="font-medium mb-3">주요 기능:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 자동화된 워크플로우 실행</li>
                <li>• 실시간 모니터링 및 알림</li>
                <li>• 커스터마이징 가능한 설정</li>
                <li>• 상세한 실행 로그 제공</li>
                <li>• API 연동 지원</li>
              </ul>
            </div>
          </Card>

          {/* 태그 */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">태그</h2>
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>

          {/* 작성자 정보 */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">작성자</h2>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden relative">
                {template.author.avatar ? (
                  <Image
                    src={template.author.avatar}
                    alt={template.author.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    {template.author.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-medium">{template.author.name}</h3>
                <p className="text-sm text-muted-foreground">
                  워크플로우 전문가
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  다른 템플릿 보기
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* 사이드바 (1/4) */}
        <div className="lg:col-span-1 space-y-6">
          {/* 구매 카드 */}
          <Card className="p-6 ">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-primary mb-2">
                {template.price} 크레딧
              </div>
              {template.price > 0 && (
                <p className="text-sm text-muted-foreground">일회성 구매</p>
              )}
            </div>

            <div className="space-y-3">
              {/* 장바구니 버튼 */}
              {!template.isPurchased && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={isInCart(template.id)}
                >
                  {isInCart(template.id) ? (
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
                className="w-full"
                onClick={handlePurchase}
                disabled={template.isPurchased}
              >
                {template.isPurchased ? (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    구매완료
                  </>
                ) : template.price > 0 ? (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    구매하기
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    무료 다운로드
                  </>
                )}
              </Button>

              {template.isPurchased && (
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  다운로드
                </Button>
              )}
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">카테고리:</span>
                <span>{template.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">마지막 업데이트:</span>
                <span>{template.updatedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">평점:</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{template.rating}</span>
                </div>
              </div>
            </div>
          </Card>
          {/* 관련 템플릿 */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">관련 템플릿</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-md flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      관련 템플릿 {item}
                    </h4>
                    <p className="text-xs text-muted-foreground">3 크레딧</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">4.5</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
