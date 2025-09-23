import type { StateCreator } from "zustand";
import type {
  PurchaseDialogState,
  WorkflowTemplate,
} from "@/features/store/types";

const defaultDialogState: PurchaseDialogState = {
  isOpen: false,
  templateIds: [],
  status: "idle",
};

export interface PurchaseSlice {
  purchaseDialog: PurchaseDialogState;
  openPurchaseDialog: (templateIds: string[]) => void;
  closePurchaseDialog: () => void;
  startPurchaseProcessing: () => void;
  completePurchase: () => string[];
}

export const selectPurchaseTemplates = (
  templateIds: string[],
  templates: WorkflowTemplate[],
) =>
  templateIds
    .map((templateId) => templates.find((template) => template.id === templateId))
    .filter((template): template is WorkflowTemplate => Boolean(template));

export const createPurchaseSlice: StateCreator<PurchaseSlice> = (set) => ({
  purchaseDialog: { ...defaultDialogState, templateIds: [] },
  openPurchaseDialog: (templateIds) => {
    const uniqueTemplateIds = Array.from(new Set(templateIds));
    set({
      purchaseDialog: {
        isOpen: true,
        templateIds: uniqueTemplateIds,
        status: "idle",
      },
    });
  },
  closePurchaseDialog: () => {
    set({ purchaseDialog: { ...defaultDialogState, templateIds: [] } });
  },
  startPurchaseProcessing: () => {
    set((state) => ({
      purchaseDialog: {
        ...state.purchaseDialog,
        status: "processing",
      },
    }));
  },
  completePurchase: () => {
    let purchasedTemplateIds: string[] = [];

    set((state) => {
      purchasedTemplateIds = [...state.purchaseDialog.templateIds];

      return {
        purchaseDialog: {
          ...state.purchaseDialog,
          status: "completed",
        },
      };
    });

    return purchasedTemplateIds;
  },
});
