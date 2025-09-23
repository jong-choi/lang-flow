import { useMemo } from "react";
import { useStoreStore } from "@/features/store/providers/store-store-provider";
import { findTemplateById } from "@/features/store/stores/slices/catalog-slice";
import type { WorkflowTemplate } from "@/features/store/types";

export function useTemplateById(templateId: string | null | undefined) {
  const templates = useStoreStore.use.templates();

  return useMemo<WorkflowTemplate | undefined>(() => {
    if (!templateId) {
      return undefined;
    }

    return findTemplateById(templates, templateId);
  }, [templates, templateId]);
}
