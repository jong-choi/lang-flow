import type { StateCreator } from "zustand";

export interface NodeActionsSlice {
  nodeRetryRequest: { id: string; nodeId: string } | null;
  requestNodeRetry: (nodeId: string) => void;
  consumeNodeRetryRequest: () => void;
}

export const createNodeActionsSlice: StateCreator<NodeActionsSlice> = (
  set,
) => ({
  nodeRetryRequest: null,
  requestNodeRetry: (nodeId) =>
    set({
      nodeRetryRequest: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        nodeId,
      },
    }),
  consumeNodeRetryRequest: () => set({ nodeRetryRequest: null }),
});
