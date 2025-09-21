import type { StateCreator } from "zustand";
import type { FlowGeneratorState } from "../flow-store";

export interface RunMetaState {
  failedNodeIds: Set<string>;
  failedCount: number;
  currentLevelIndex: number;
  levels: string[][];
  setFailedNodeIds: (ids: Set<string>) => void;
  setFailedCount: (n: number) => void;
  setCurrentLevelIndex: (i: number) => void;
  setLevels: (lv: string[][]) => void;
}

export interface RunMetaSlice {
  runMeta: RunMetaState;
}

export const createRunMetaSlice: StateCreator<
  FlowGeneratorState,
  [],
  [],
  RunMetaSlice
> = (set) => ({
  runMeta: {
    failedNodeIds: new Set<string>(),
    failedCount: 0,
    currentLevelIndex: 0,
    levels: [],
    setFailedNodeIds: (ids: Set<string>) =>
      set((prevState) => ({
        runMeta: { ...prevState.runMeta, failedNodeIds: new Set(ids) },
      })),
    setFailedCount: (count: number) =>
      set((prevState) => ({
        runMeta: { ...prevState.runMeta, failedCount: count },
      })),
    setCurrentLevelIndex: (index: number) =>
      set((prevState) => ({
        runMeta: { ...prevState.runMeta, currentLevelIndex: index },
      })),
    setLevels: (levelsArg: string[][]) =>
      set((prevState) => ({
        runMeta: { ...prevState.runMeta, levels: levelsArg },
      })),
  },
});
