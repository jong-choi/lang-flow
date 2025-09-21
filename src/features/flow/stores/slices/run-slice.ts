import type { StateCreator } from "zustand";
import type { FlowGeneratorState } from "../flow-store";

export interface RunState {
  isRunning: boolean;
  setRunning: (running: boolean) => void;
}

export interface RunSlice {
  run: RunState;
}

export const createRunSlice: StateCreator<
  FlowGeneratorState,
  [],
  [],
  RunSlice
> = (set) => ({
  run: {
    isRunning: false,
    setRunning: (running: boolean) =>
      set((prevState) => ({ run: { ...prevState.run, isRunning: running } })),
  },
});
