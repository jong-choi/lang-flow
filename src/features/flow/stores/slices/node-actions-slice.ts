import type { StateCreator } from "zustand";
import type { FlowGeneratorState } from "../flow-store";

export interface NodeActionsState {
  retryNode?: (nodeId: string) => void | Promise<void>;
  setRetryNode: (fn: NodeActionsState["retryNode"]) => void;
}

export interface NodeActionsSlice {
  nodeActions: NodeActionsState;
}

export const createNodeActionsSlice: StateCreator<
  FlowGeneratorState,
  [],
  [],
  NodeActionsSlice
> = (set) => ({
  nodeActions: {
    retryNode: undefined,
    setRetryNode: (retryFn) =>
      set((prevState) => ({
        nodeActions: { ...prevState.nodeActions, retryNode: retryFn },
      })),
  },
});
