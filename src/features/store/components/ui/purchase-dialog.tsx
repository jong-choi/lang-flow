"use client";

import { useEffect, useMemo, useRef } from "react";
import { Check, CreditCard, Crown, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useStoreStore } from "@/features/store/providers/store-store-provider";
import { selectPurchaseTemplates } from "@/features/store/stores/slices/purchase-slice";

const CURRENT_CREDITS = 15;

export function PurchaseDialog() {
  const purchaseDialog = useStoreStore.use.purchaseDialog();
  const templates = useStoreStore.use.templates();
  const markTemplatePurchased = useStoreStore.use.markTemplatePurchased();
  const removeFromCart = useStoreStore.use.removeFromCart();
  const purchaseTemplates = useMemo(
    () => selectPurchaseTemplates(purchaseDialog.templateIds, templates),
    [purchaseDialog.templateIds, templates],
  );
  const closePurchaseDialog = useStoreStore.use.closePurchaseDialog();
  const startPurchaseProcessing = useStoreStore.use.startPurchaseProcessing();
  const completePurchase = useStoreStore.use.completePurchase();

  const timersRef = useRef<number[]>([]);

  const representativeTemplate = purchaseTemplates[0];
  const totalPrice = useMemo(
    () => purchaseTemplates.reduce((sum, template) => sum + template.price, 0),
    [purchaseTemplates],
  );
  const isAffordable = CURRENT_CREDITS >= totalPrice;
  const isOpen = purchaseDialog.isOpen && purchaseTemplates.length > 0;
  const isProcessing = purchaseDialog.status === "processing";
  const isCompleted = purchaseDialog.status === "completed";

  const clearTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    if (purchaseDialog.status === "completed") {
      const timer = window.setTimeout(() => {
        closePurchaseDialog();
        clearTimers();
      }, 2000);
      timersRef.current.push(timer);
    }
  }, [purchaseDialog.status, closePurchaseDialog]);

  const handlePurchase = () => {
    if (!isAffordable || isProcessing) {
      return;
    }

    startPurchaseProcessing();
    const timer = window.setTimeout(() => {
      const purchasedTemplateIds = completePurchase();

      purchasedTemplateIds.forEach((templateId) => {
        markTemplatePurchased(templateId);
        removeFromCart(templateId);
      });
    }, 1500);
    timersRef.current.push(timer);
  };

  const handleClose = () => {
    if (isProcessing) {
      return;
    }
    clearTimers();
    closePurchaseDialog();
  };

  if (!isOpen || !representativeTemplate) {
    return null;
  }

  if (isCompleted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent showCloseButton={false}>
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="mb-2 text-2xl font-bold">
              구매 완료!
            </DialogTitle>
            <p className="mb-6 text-muted-foreground">
              워크플로우 템플릿을 성공적으로 구매했습니다.
            </p>
            <div className="w-full max-w-md">
              <Card className="mb-4 p-4">
                <div className="flex items-center gap-3">
                  <Crown className="h-8 w-8 text-yellow-500" />
                  <div className="flex-1 text-left">
                    <h3 className="font-medium">
                      {representativeTemplate.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {totalPrice} 크레딧 결제 완료
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
          <div className="mb-6 flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              템플릿 구매
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Card className="mb-6 p-4">
            <div className="flex gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-100 to-purple-100">
                <span className="text-lg font-bold text-gray-400">
                  {representativeTemplate.title.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="mb-1 font-medium">
                  {representativeTemplate.title}
                </h3>
                <p className="mb-2 text-sm text-muted-foreground">
                  작성자: {representativeTemplate.author.name}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">
                    {representativeTemplate.price}
                  </span>
                  <span className="text-sm text-muted-foreground">크레딧</span>
                </div>
                {purchaseTemplates.length > 1 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    외 {purchaseTemplates.length - 1}개의 템플릿 포함
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card className="mb-6 space-y-3 p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">보유 크레딧:</span>
              <span className="font-medium">{CURRENT_CREDITS} 크레딧</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">구매 금액:</span>
              <span className="font-medium">-{totalPrice} 크레딧</span>
            </div>
            <hr />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">구매 후 잔액:</span>
              <span
                className={`font-bold ${isAffordable ? "text-green-600" : "text-red-600"}`}
              >
                {CURRENT_CREDITS - totalPrice} 크레딧
              </span>
            </div>
          </Card>

          {!isAffordable && (
            <Card className="mb-6 border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 text-red-600">
                <X className="h-4 w-4" />
                <span className="text-sm font-medium">크레딧이 부족합니다</span>
              </div>
              <p className="mt-1 text-sm text-red-600">
                {totalPrice - CURRENT_CREDITS}개의 크레딧이 더 필요합니다.
              </p>
            </Card>
          )}

          <div className="mb-6 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>평생 사용 가능</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>무제한 수정 및 커스터마이징</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>업데이트 자동 적용</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>기술 지원</span>
            </div>
          </div>

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
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  처리중...
                </>
              ) : totalPrice > 0 ? (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {totalPrice} 크레딧으로 구매
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  무료 다운로드
                </>
              )}
            </Button>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            구매를 진행하면 이용약관 및 개인정보처리방침에 동의하는 것으로
            간주됩니다.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
