import type { StateCreator } from "zustand";

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

export const createRunMetaSlice: StateCreator<RunMetaSlice> = (set) => ({
  failedNodeIds: new Set<string>(),
  failedCount: 0,
  currentLevelIndex: 0,
  levels: [],
  setFailedNodeIds: (ids: Set<string>) => set({ failedNodeIds: new Set(ids) }),
  setFailedCount: (count: number) => set({ failedCount: count }),
  setCurrentLevelIndex: (index: number) => set({ currentLevelIndex: index }),
  setLevels: (levelsArg: string[][]) => set({ levels: levelsArg }),
});
