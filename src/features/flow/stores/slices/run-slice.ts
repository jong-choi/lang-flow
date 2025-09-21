import type { StateCreator } from "zustand";
import type { FlowGeneratorState } from "../flow-store";

export interface RunState {
  logs: string[];
  isRunning: boolean;
  addLog: (message: string) => void;
  clearLogs: () => void;
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
    logs: [],
    isRunning: false,
    addLog: (message: string) =>
      set((prevState) => ({
        run: { ...prevState.run, logs: [...prevState.run.logs, message] },
      })),
    clearLogs: () =>
      set((prevState) => ({ run: { ...prevState.run, logs: [] } })),
    setRunning: (running: boolean) =>
      set((prevState) => ({ run: { ...prevState.run, isRunning: running } })),
  },
});
