import type { StateCreator } from "zustand";

export interface RunSlice {
  isRunning: boolean;
  setRunning: (running: boolean) => void;
}

export const createRunSlice: StateCreator<RunSlice> = (set) => ({
  isRunning: false,
  setRunning: (running: boolean) => set({ isRunning: running }),
});
