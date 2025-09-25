import type { WorkflowTemplate } from "./workflow-template";

export interface CartItem {
  templateId: string;
  addedAt: string;
}

export interface CartItemWithTemplate extends CartItem {
  template: WorkflowTemplate;
}

export interface CartTotals {
  totalItems: number;
  totalPrice: number;
}

export interface CartSnapshot extends CartTotals {
  items: CartItemWithTemplate[];
}
