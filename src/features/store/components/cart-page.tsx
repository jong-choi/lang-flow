import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/features/store/hooks/use-cart";
import type { WorkflowTemplate } from "@/types/store";

interface CartPageProps {
  onProceedToCheckout?: (templates: WorkflowTemplate[]) => void;
}

export function CartPage({ onProceedToCheckout }: CartPageProps) {
  const { cartState, removeFromCart, clearCart } = useCart();

  const handleProceedToCheckout = () => {
    if (onProceedToCheckout) {
      const templates = cartState.items.map((item) => item.template);
      onProceedToCheckout(templates);
    }
  };

  // 현재 크레딧 (목업 데이터)
  const currentCredits = 15;
  const isAffordable = currentCredits >= cartState.totalPrice;

  if (cartState.totalItems === 0) {
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
          <h3 className="text-xl font-semibold mb-2">
            장바구니가 비어있습니다
          </h3>
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
            {cartState.totalItems}개 항목
          </Badge>
        </div>

        <Button
          variant="outline"
          onClick={clearCart}
          className="text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          전체 삭제
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 장바구니 항목들 (3/4) */}
        <div className="lg:col-span-3 space-y-4">
          {cartState.items.map((item) => (
            <Card key={item.template.id} className="p-6">
              <div className="flex gap-4">
                {/* 템플릿 이미지 */}
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-400">
                    {item.template.title.charAt(0)}
                  </span>
                </div>

                {/* 템플릿 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {item.template.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {item.template.description}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {item.template.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          작성자: {item.template.author.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {item.template.price} 크레딧
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromCart(item.template.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* 결제 요약 사이드바 (1/4) */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h3 className="text-xl font-semibold mb-6">결제 요약</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  템플릿 {cartState.totalItems}개
                </span>
                <span className="font-medium">
                  {cartState.totalPrice} 크레딧
                </span>
              </div>

              <hr />

              <div className="flex justify-between text-lg font-semibold">
                <span>총 결제 금액</span>
                <span className="text-primary">
                  {cartState.totalPrice} 크레딧
                </span>
              </div>
            </div>

            {/* 크레딧 잔액 정보 */}
            <div className="bg-muted p-4 rounded-lg mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">보유 크레딧:</span>
                  <span className="font-medium">{currentCredits} 크레딧</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">결제 후 잔액:</span>
                  <span
                    className={`font-medium ${isAffordable ? "text-green-600" : "text-red-600"}`}
                  >
                    {currentCredits - cartState.totalPrice} 크레딧
                  </span>
                </div>
              </div>
            </div>

            {/* 크레딧 부족 경고 */}
            {!isAffordable && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="text-sm text-red-600">
                  <p className="font-medium">크레딧이 부족합니다</p>
                  <p>
                    {cartState.totalPrice - currentCredits}개의 크레딧이 더
                    필요합니다.
                  </p>
                </div>
              </div>
            )}

            {/* 결제 버튼 */}
            <Button
              className="w-full"
              disabled={!isAffordable}
              onClick={handleProceedToCheckout}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {cartState.totalPrice} 크레딧으로 결제
            </Button>

            {/* 계속 쇼핑 */}
            <Link href="/store" className="block mt-4">
              <Button variant="outline" className="w-full">
                계속 쇼핑하기
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
