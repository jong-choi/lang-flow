import type { StateCreator } from "zustand";
import type { FlowGeneratorState } from "../flow-store";

export interface RunSlice {
  isRunning: boolean;
  setRunning: (running: boolean) => void;
}

export const createRunSlice: StateCreator<
  FlowGeneratorState,
  [],
  [],
  RunSlice
> = (set) => ({
  isRunning: false,
  setRunning: (running: boolean) =>
    set((prevState) => ({ ...prevState, isRunning: running })),
});
