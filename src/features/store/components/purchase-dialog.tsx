import { useState } from "react";
import { Check, CreditCard, Crown, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { WorkflowTemplate } from "@/types/store";

interface PurchaseDialogProps {
  template: WorkflowTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (template: WorkflowTemplate) => void;
}

export function PurchaseDialog({
  template,
  isOpen,
  onClose,
  onConfirm,
}: PurchaseDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!template) return null;

  const handlePurchase = async () => {
    setIsProcessing(true);

    // 구매 처리 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setIsCompleted(true);

    // 2초 후 완료
    setTimeout(() => {
      onConfirm(template);
      setIsCompleted(false);
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    if (!isProcessing) {
      setIsCompleted(false);
      onClose();
    }
  };

  // 현재 크레딧 (목업 데이터)
  const currentCredits = 15;
  const isAffordable = currentCredits >= template.price;

  if (isCompleted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent showCloseButton={false}>
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold mb-2">
              구매 완료!
            </DialogTitle>
            <p className="text-muted-foreground mb-6">
              워크플로우 템플릿을 성공적으로 구매했습니다.
            </p>
            <div className="w-full max-w-md">
              <Card className="p-4 mb-4">
                <div className="flex items-center gap-3">
                  <Crown className="w-8 h-8 text-yellow-500" />
                  <div className="flex-1">
                    <h3 className="font-medium">{template.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {template.price} 크레딧
                    </p>
                  </div>
                </div>
              </Card>
              <p className="text-sm text-muted-foreground">
                잠시 후 자동으로 창이 닫힙니다...
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent showCloseButton={false}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <DialogTitle className="text-xl font-semibold">
              템플릿 구매
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* 템플릿 정보 */}
          <Card className="p-4 mb-6">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-400">
                  {template.title.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">{template.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  작성자: {template.author.name}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">
                    {template.price}
                  </span>
                  <span className="text-sm text-muted-foreground">크레딧</span>
                </div>
              </div>
            </div>
          </Card>

          {/* 크레딧 정보 */}
          <Card className="p-4 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">보유 크레딧:</span>
                <span className="font-medium">{currentCredits} 크레딧</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">구매 금액:</span>
                <span className="font-medium">-{template.price} 크레딧</span>
              </div>
              <hr />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">구매 후 잔액:</span>
                <span
                  className={`font-bold ${isAffordable ? "text-green-600" : "text-red-600"}`}
                >
                  {currentCredits - template.price} 크레딧
                </span>
              </div>
            </div>
          </Card>

          {/* 구매할 수 없는 경우 */}
          {!isAffordable && (
            <Card className="p-4 mb-6 border-red-200 bg-red-50">
              <div className="flex items-center gap-2 text-red-600">
                <X className="w-4 h-4" />
                <span className="text-sm font-medium">크레딧이 부족합니다</span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                {template.price - currentCredits}개의 크레딧이 더 필요합니다.
              </p>
            </Card>
          )}

          {/* 구매 혜택 */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">구매 혜택:</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>평생 사용 가능</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>무제한 수정 및 커스터마이징</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>업데이트 자동 적용</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>기술 지원</span>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              취소
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={!isAffordable || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  처리중...
                </>
              ) : template.price > 0 ? (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {template.price} 크레딧으로 구매
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  무료 다운로드
                </>
              )}
            </Button>
          </div>

          {/* 이용약관 */}
          <p className="text-xs text-muted-foreground mt-4 text-center">
            구매를 진행하면 이용약관 및 개인정보처리방침에 동의하는 것으로
            간주됩니다.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
