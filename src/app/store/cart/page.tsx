"use client";

import { useState } from "react";
import { CartPage } from "@/features/store/components/cart-page";
import { PurchaseDialog } from "@/features/store/components/purchase-dialog";
import type { WorkflowTemplate } from "@/types/store";

export default function StoreCartPage() {
  const [purchaseTemplates, setPurchaseTemplates] = useState<
    WorkflowTemplate[]
  >([]);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  const handleProceedToCheckout = (templates: WorkflowTemplate[]) => {
    setPurchaseTemplates(templates);
    setShowPurchaseDialog(true);
  };

  const handlePurchaseConfirm = () => {
    // 구매 완료 처리 (실제로는 API 호출)
    console.log("장바구니 구매 완료:", purchaseTemplates);
    setShowPurchaseDialog(false);
    setPurchaseTemplates([]);
  };

  const handlePurchaseCancel = () => {
    setShowPurchaseDialog(false);
    setPurchaseTemplates([]);
  };

  // 대표 템플릿 (첫 번째 템플릿) 사용
  const representativeTemplate = purchaseTemplates[0] || null;

  return (
    <>
      <CartPage onProceedToCheckout={handleProceedToCheckout} />

      <PurchaseDialog
        template={representativeTemplate}
        isOpen={showPurchaseDialog}
        onClose={handlePurchaseCancel}
        onConfirm={handlePurchaseConfirm}
      />
    </>
  );
}
