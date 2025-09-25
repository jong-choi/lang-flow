export type PurchaseDialogStatus = "idle" | "processing" | "completed";

export interface PurchaseDialogState {
  isOpen: boolean;
  templateIds: string[];
  status: PurchaseDialogStatus;
}
