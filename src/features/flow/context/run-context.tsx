"use client";

import React from "react";

interface RunContextValue {
  logs: string[];
  addLog: (message: string) => void;
  clearLogs: () => void;
  isRunning: boolean;
  setRunning: (running: boolean) => void;
}

const RunContext = React.createContext<RunContextValue | null>(null);

export function RunProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = React.useState<string[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);

  const addLog = React.useCallback((message: string) => {
    setLogs((prev) => [...prev, message]);
  }, []);

  const clearLogs = React.useCallback(() => setLogs([]), []);
  const setRunning = React.useCallback(
    (running: boolean) => setIsRunning(running),
    [],
  );

  const value = React.useMemo<RunContextValue>(
    () => ({ logs, addLog, clearLogs, isRunning, setRunning }),
    [logs, addLog, clearLogs, isRunning, setRunning],
  );

  return <RunContext.Provider value={value}>{children}</RunContext.Provider>;
}

export function useRunContext(): RunContextValue {
  const ctx = React.useContext(RunContext);
  if (!ctx) {
    throw new Error("useRunContext must be used within RunProvider");
  }
  return ctx;
}
