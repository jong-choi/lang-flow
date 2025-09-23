import { useMemo } from "react";
import type { WorkflowTemplate } from "@/features/store/types";
import { useStoreStore } from "@/features/store/providers/store-store-provider";
import { findTemplateById } from "@/features/store/stores/slices/catalog-slice";

export function useTemplateById(templateId: string | null | undefined) {
  const templates = useStoreStore.use.templates();

  return useMemo<WorkflowTemplate | undefined>(() => {
    if (!templateId) {
      return undefined;
    }

    return findTemplateById(templates, templateId);
  }, [templates, templateId]);
}
