import type { StateCreator } from "zustand";
import type { FlowNodeType } from "@/features/flow/types/nodes";

export interface DnDSlice {
  draggingType: FlowNodeType | undefined;
  setDraggingType: (t: FlowNodeType | undefined) => void;
}

export const createDnDSlice: StateCreator<DnDSlice> = (set) => ({
  draggingType: undefined,
  setDraggingType: (draggingType) => set({ draggingType }),
});
