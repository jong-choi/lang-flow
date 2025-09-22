import type { StateCreator } from "zustand";
import type { FlowNodeType } from "@/features/flow/types/nodes";
import type { FlowGeneratorState } from "../flow-store";

export interface DnDSlice {
  draggingType: FlowNodeType | undefined;
  setDraggingType: (t: FlowNodeType | undefined) => void;
}

export const createDnDSlice: StateCreator<
  FlowGeneratorState,
  [],
  [],
  DnDSlice
> = (set) => ({
  draggingType: undefined,
  setDraggingType: (draggingType) =>
    set((prevState) => ({ ...prevState, draggingType })),
});
