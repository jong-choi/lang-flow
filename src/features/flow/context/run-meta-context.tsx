"use client";

import React from "react";

interface RunMetaContextValue {
  failedNodeIds: Set<string>;
  setFailedNodeIds: (ids: Set<string>) => void;
  failedCount: number;
  setFailedCount: (n: number) => void;
  currentLevelIndex: number;
  setCurrentLevelIndex: (i: number) => void;
  levels: string[][];
  setLevels: (levels: string[][]) => void;
}

const RunMetaContext = React.createContext<RunMetaContextValue | null>(null);

export function RunMetaProvider({ children }: { children: React.ReactNode }) {
  const [failedNodeIdsState, setFailedNodeIdsState] = React.useState<
    Set<string>
  >(new Set());
  const [failedCount, setFailedCount] = React.useState(0);
  const [currentLevelIndex, setCurrentLevelIndex] = React.useState(0);
  const [levels, setLevels] = React.useState<string[][]>([]);

  const setFailedNodeIds = React.useCallback((ids: Set<string>) => {
    setFailedNodeIdsState(new Set(ids));
  }, []);

  const value = React.useMemo<RunMetaContextValue>(
    () => ({
      failedNodeIds: failedNodeIdsState,
      setFailedNodeIds,
      failedCount,
      setFailedCount,
      currentLevelIndex,
      setCurrentLevelIndex,
      levels,
      setLevels,
    }),
    [
      failedNodeIdsState,
      setFailedNodeIds,
      failedCount,
      setFailedCount,
      currentLevelIndex,
      setCurrentLevelIndex,
      levels,
      setLevels,
    ],
  );

  return (
    <RunMetaContext.Provider value={value}>{children}</RunMetaContext.Provider>
  );
}

export function useRunMetaContext(): RunMetaContextValue {
  const ctx = React.useContext(RunMetaContext);
  if (!ctx)
    throw new Error("useRunMetaContext must be used within RunMetaProvider");
  return ctx;
}
