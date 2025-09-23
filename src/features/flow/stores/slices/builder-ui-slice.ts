import type { StateCreator } from "zustand";
import type { WorkflowTemplateSummary } from "@/features/flow/types/nodes";
import type { FlowGeneratorState } from "../flow-store";

export interface TemplateActionState {
  template: WorkflowTemplateSummary;
  action: "edit" | "delete";
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

export const createBuilderUiSlice: StateCreator<
  FlowGeneratorState,
  [],
  [],
  BuilderUiSlice
> = (set) => ({
  workflowName: "untitled",
  setWorkflowName: (nextName) =>
    set((prev) => ({
      ...prev,
      workflowName: nextName,
    })),
  isTemplateModalOpen: false,
  setTemplateModalOpen: (open) =>
    set((prev) => ({
      ...prev,
      isTemplateModalOpen: open,
    })),
  isSavingTemplate: false,
  setIsSavingTemplate: (isSaving) =>
    set((prev) => ({
      ...prev,
      isSavingTemplate: isSaving,
    })),
  confirmTemplateAction: null,
  setConfirmTemplateAction: (action) =>
    set((prev) => ({
      ...prev,
      confirmTemplateAction: action,
    })),
  navigationAfterSave: null,
  setNavigationAfterSave: (action) =>
    set((prev) => ({
      ...prev,
      navigationAfterSave: action,
    })),
});
