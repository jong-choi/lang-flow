import type { StateCreator } from "zustand";

export interface RunControlsSlice {
  canRun: boolean;
  runDisabledReason: string | null;
  canRetry: boolean;
  setRunGate: (
    partial: Partial<{
      canRun: boolean;
      runDisabledReason: string | null;
      canRetry: boolean;
    }>,
  ) => void;

  runRequest: { id: string; prompt: string } | null;
  cancelRequestId: string | null;
  retryRequestId: string | null;
  requestRun: (prompt: string) => void;
  requestCancel: () => void;
  requestRetry: () => void;
  consumeRunRequest: () => void;
  consumeCancelRequest: () => void;
  consumeRetryRequest: () => void;
}

export const createRunControlsSlice: StateCreator<RunControlsSlice> = (set, get) => ({
  canRun: false,
  runDisabledReason: null,
  canRetry: false,
  setRunGate: (partial) => {
    const state = get();
    const updates: Partial<RunControlsSlice> = {};

    if (partial.canRun !== undefined && partial.canRun !== state.canRun) {
      updates.canRun = partial.canRun;
    }

    if (
      partial.runDisabledReason !== undefined &&
      partial.runDisabledReason !== state.runDisabledReason
    ) {
      updates.runDisabledReason = partial.runDisabledReason;
    }

    if (partial.canRetry !== undefined && partial.canRetry !== state.canRetry) {
      updates.canRetry = partial.canRetry;
    }

    if (Object.keys(updates).length === 0) {
      return;
    }

    set(updates);
  },

  runRequest: null,
  cancelRequestId: null,
  retryRequestId: null,
  requestRun: (prompt) =>
    set({
      runRequest: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        prompt,
      },
    }),
  requestCancel: () =>
    set({
      cancelRequestId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    }),
  requestRetry: () =>
    set({
      retryRequestId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    }),
  consumeRunRequest: () => set({ runRequest: null }),
  consumeCancelRequest: () => set({ cancelRequestId: null }),
  consumeRetryRequest: () => set({ retryRequestId: null }),
});
