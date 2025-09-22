import type { StateCreator } from "zustand";
import type { FlowGeneratorState } from "../flow-store";

export interface RunMetaSlice {
  failedNodeIds: Set<string>;
  failedCount: number;
  currentLevelIndex: number;
  levels: string[][];
  setFailedNodeIds: (ids: Set<string>) => void;
  setFailedCount: (n: number) => void;
  setCurrentLevelIndex: (i: number) => void;
  setLevels: (lv: string[][]) => void;
}

export const createRunMetaSlice: StateCreator<
  FlowGeneratorState,
  [],
  [],
  RunMetaSlice
> = (set) => ({
  failedNodeIds: new Set<string>(),
  failedCount: 0,
  currentLevelIndex: 0,
  levels: [],
  setFailedNodeIds: (ids: Set<string>) =>
    set((prevState) => ({
      ...prevState,
      failedNodeIds: new Set(ids),
    })),
  setFailedCount: (count: number) =>
    set((prevState) => ({
      ...prevState,
      failedCount: count,
    })),
  setCurrentLevelIndex: (index: number) =>
    set((prevState) => ({
      ...prevState,
      currentLevelIndex: index,
    })),
  setLevels: (levelsArg: string[][]) =>
    set((prevState) => ({
      ...prevState,
      levels: levelsArg,
    })),
});;
