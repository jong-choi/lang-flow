"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PurchaseDialog } from "@/features/store/components/purchase-dialog";
import { TemplateDetail } from "@/features/store/components/template-detail";
import { mockTemplates } from "@/features/store/mock-data";
import type { WorkflowTemplate } from "@/types/store";

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<WorkflowTemplate | null>(null);
  const [purchaseTemplate, setPurchaseTemplate] =
    useState<WorkflowTemplate | null>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  useEffect(() => {
    if (params.templateId) {
      const foundTemplate = mockTemplates.find(
        (t) => t.id === params.templateId,
      );
      setTemplate(foundTemplate || null);
    }
  }, [params.templateId]);

  const handleTemplatePurchase = (template: WorkflowTemplate) => {
    setPurchaseTemplate(template);
    setShowPurchaseDialog(true);
  };

  const handlePurchaseConfirm = (template: WorkflowTemplate) => {
    // 구매 완료 처리 (실제로는 API 호출)
    console.log("구매 완료:", template);
    setShowPurchaseDialog(false);
    setPurchaseTemplate(null);

    // 템플릿을 구매 완료 상태로 업데이트
    setTemplate((prevTemplate) =>
      prevTemplate ? { ...prevTemplate, isPurchased: true } : null,
    );
  };

  const handlePurchaseCancel = () => {
    setShowPurchaseDialog(false);
    setPurchaseTemplate(null);
  };

  const handleBackToStore = () => {
    router.push("/store");
  };

  if (!template) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h1 className="text-2xl font-bold mb-2">
              템플릿을 찾을 수 없습니다
            </h1>
            <p className="text-muted-foreground mb-4">
              요청하신 템플릿이 존재하지 않거나 삭제되었습니다.
            </p>
            <button
              onClick={handleBackToStore}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              스토어로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <TemplateDetail
        template={template}
        onBack={handleBackToStore}
        onPurchase={handleTemplatePurchase}
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
