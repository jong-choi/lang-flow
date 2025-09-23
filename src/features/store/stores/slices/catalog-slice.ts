import type { StateCreator } from "zustand";
import { mockTemplates } from "@/features/store/mock-data";
import type { WorkflowTemplate } from "@/features/store/types";

export const findTemplateById = (
  templates: WorkflowTemplate[],
  templateId: string,
) => templates.find((template) => template.id === templateId);

export interface CatalogSlice {
  templates: WorkflowTemplate[];
  selectedTemplateId: string | null;
  loadTemplates: (templates: WorkflowTemplate[]) => void;
  setSelectedTemplateId: (templateId: string | null) => void;
  markTemplatePurchased: (templateId: string) => void;
  updateTemplate: (
    templateId: string,
    updates: Partial<WorkflowTemplate>,
  ) => void;
}

export const createCatalogSlice: StateCreator<CatalogSlice> = (set) => ({
  templates: mockTemplates,
  selectedTemplateId: null,
  loadTemplates: (templates) => {
    set({ templates });
  },
  setSelectedTemplateId: (templateId) => {
    set({ selectedTemplateId: templateId });
  },
  markTemplatePurchased: (templateId) => {
    set((state) => ({
      templates: state.templates.map((template) =>
        template.id === templateId
          ? { ...template, isPurchased: true }
          : template,
      ),
    }));
  },
  updateTemplate: (templateId, updates) => {
    set((state) => ({
      templates: state.templates.map((template) =>
        template.id === templateId ? { ...template, ...updates } : template,
      ),
    }));
  },
});
