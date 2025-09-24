import type { StateCreator } from "zustand";
import type { WorkflowTemplateSummary } from "@/features/flow/types/nodes";

export interface TemplateActionState {
  template: WorkflowTemplateSummary;
  action: "move" | "delete" | "edit";
}

export interface BuilderUiSlice {
  workflowName: string;
  setWorkflowName: (nextName: string) => void;
  isTemplateModalOpen: boolean;
  setTemplateModalOpen: (open: boolean) => void;
  isSavingTemplate: boolean;
  setIsSavingTemplate: (isSaving: boolean) => void;
  confirmTemplateAction: TemplateActionState | null;
  setConfirmTemplateAction: (action: TemplateActionState | null) => void;
  navigationAfterSave: TemplateActionState | null;
  setNavigationAfterSave: (action: TemplateActionState | null) => void;
}

export const createBuilderUiSlice: StateCreator<BuilderUiSlice> = (set) => ({
  workflowName: "untitled",
  setWorkflowName: (nextName) =>
    set({
      workflowName: nextName,
    }),
  isTemplateModalOpen: false,
  setTemplateModalOpen: (open) =>
    set({
      isTemplateModalOpen: open,
    }),
  isSavingTemplate: false,
  setIsSavingTemplate: (isSaving) =>
    set({
      isSavingTemplate: isSaving,
    }),
  confirmTemplateAction: null,
  setConfirmTemplateAction: (action) =>
    set({
      confirmTemplateAction: action,
    }),
  navigationAfterSave: null,
  setNavigationAfterSave: (action) =>
    set({
      navigationAfterSave: action,
    }),
});
