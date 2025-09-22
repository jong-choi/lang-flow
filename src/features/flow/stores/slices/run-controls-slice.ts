import type { StateCreator } from "zustand";
import type { FlowGeneratorState } from "../flow-store";

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

export const createRunControlsSlice: StateCreator<
  FlowGeneratorState,
  [],
  [],
  RunControlsSlice
> = (set) => ({
  canRun: false,
  runDisabledReason: null,
  canRetry: false,
  setRunGate: (partial) =>
    set((prev) => ({
      ...prev,
      ...partial,
    })),

  runRequest: null,
  cancelRequestId: null,
  retryRequestId: null,
  requestRun: (prompt) =>
    set((prev) => ({
      ...prev,
      runRequest: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        prompt,
      },
    })),
  requestCancel: () =>
    set((prev) => ({
      ...prev,
      cancelRequestId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    })),
  requestRetry: () =>
    set((prev) => ({
      ...prev,
      retryRequestId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    })),
  consumeRunRequest: () =>
    set((prev) => ({
      ...prev,
      runRequest: null,
    })),
  consumeCancelRequest: () =>
    set((prev) => ({
      ...prev,
      cancelRequestId: null,
    })),
  consumeRetryRequest: () =>
    set((prev) => ({
      ...prev,
      retryRequestId: null,
    })),
});
