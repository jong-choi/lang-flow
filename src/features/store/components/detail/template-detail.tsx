"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStoreStore } from "@/features/store/providers/store-store-provider";
import { DetailAuthorCard } from "./detail-author-card";
import { DetailDescriptionCard } from "./detail-description-card";
import { DetailHeader } from "./detail-header";
import { DetailTagsCard } from "./detail-tags-card";
import { PurchaseCard } from "./sidebar/purchase-card";
import { RelatedTemplates } from "./sidebar/related-templates";

interface TemplateDetailProps {
  templateId: string;
}

export function TemplateDetail({ templateId }: TemplateDetailProps) {
  const router = useRouter();
  const templateExists = useStoreStore.use.templates((templates) =>
    templates.some((template) => template.id === templateId),
  );

  if (!templateExists) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-4xl">🔍</div>
            <h1 className="text-2xl font-bold">템플릿을 찾을 수 없습니다</h1>
            <p className="text-muted-foreground">
              요청하신 템플릿이 존재하지 않거나 삭제되었습니다.
            </p>
            <Button onClick={() => router.push("/store")}>스토어로 돌아가기</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push("/store")}
        className="w-fit"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        스토어로 돌아가기
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <DetailHeader templateId={templateId} />
          <DetailDescriptionCard templateId={templateId} />
          <DetailTagsCard templateId={templateId} />
          <DetailAuthorCard templateId={templateId} />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <PurchaseCard templateId={templateId} />
          <RelatedTemplates templateId={templateId} />
        </div>
      </div>
    </div>
  );
}
