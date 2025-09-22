import type { StateCreator } from "zustand";
import type { FlowGeneratorState } from "../flow-store";

export interface NodeActionsSlice {
  nodeRetryRequest: { id: string; nodeId: string } | null;
  requestNodeRetry: (nodeId: string) => void;
  consumeNodeRetryRequest: () => void;
}

export const createNodeActionsSlice: StateCreator<
  FlowGeneratorState,
  [],
  [],
  NodeActionsSlice
> = (set) => ({
  nodeRetryRequest: null,
  requestNodeRetry: (nodeId) =>
    set((prevState) => ({
      ...prevState,
      nodeRetryRequest: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        nodeId,
      },
    })),
  consumeNodeRetryRequest: () =>
    set((prevState) => ({
      ...prevState,
      nodeRetryRequest: null,
    })),
});
