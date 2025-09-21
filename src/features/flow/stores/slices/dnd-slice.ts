import type { StateCreator } from "zustand";
import type { FlowNodeType } from "@/features/flow/types/nodes";
import type { FlowGeneratorState } from "../flow-store";

export interface DnDState {
  draggingType: FlowNodeType | undefined;
  setDraggingType: (t: FlowNodeType | undefined) => void;
}

export interface DnDSlice {
  dnd: DnDState;
}

export const createDnDSlice: StateCreator<
  FlowGeneratorState,
  [],
  [],
  DnDSlice
> = (set) => ({
  dnd: {
    draggingType: undefined,
    setDraggingType: (draggingType) =>
      set((prevState) => ({ dnd: { ...prevState.dnd, draggingType } })),
  },
});
