"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { TemplateDetail } from "@/features/store/components/detail/template-detail";
import { useStoreStore } from "@/features/store/providers/store-store-provider";

export default function TemplateDetailPage() {
  const params = useParams<{ templateId: string }>();
  const templateId = params.templateId;
  const setSelectedTemplateId = useStoreStore.use.setSelectedTemplateId();

  useEffect(() => {
    if (templateId) {
      setSelectedTemplateId(templateId);
    }
  }, [templateId, setSelectedTemplateId]);

  if (!templateId) {
    return null;
  }

  return <TemplateDetail templateId={templateId} />;
}
