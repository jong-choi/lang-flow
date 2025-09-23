"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PurchaseDialog } from "@/features/store/components/purchase-dialog";
import { StoreMain } from "@/features/store/components/store-main";
import type { WorkflowTemplate } from "@/types/store";

export default function StorePage() {
  const router = useRouter();
  const [purchaseTemplate, setPurchaseTemplate] =
    useState<WorkflowTemplate | null>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  // 목록에서 템플릿을 선택하면 상세 페이지로 이동합니다.
  const handleTemplateSelect = (template: WorkflowTemplate) => {
    router.push(`/store/${template.id}`);
  };

  const handleTemplatePurchase = (template: WorkflowTemplate) => {
    setPurchaseTemplate(template);
    setShowPurchaseDialog(true);
  };

  const handlePurchaseConfirm = (template: WorkflowTemplate) => {
    // 구매 완료 처리 (실제에서는 API 호출)
    console.log("구매 완료:", template);
    setShowPurchaseDialog(false);
    setPurchaseTemplate(null);
  };

  const handlePurchaseCancel = () => {
    setShowPurchaseDialog(false);
    setPurchaseTemplate(null);
  };

  return (
    <>
      <StoreMain
        onTemplateSelect={handleTemplateSelect}
        onTemplatePurchase={handleTemplatePurchase}
      />

      <PurchaseDialog
        template={purchaseTemplate}
        isOpen={showPurchaseDialog}
        onClose={handlePurchaseCancel}
        onConfirm={handlePurchaseConfirm}
      />
    </>
  );
}
