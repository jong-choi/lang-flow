"use client";

import React from "react";

type NodeActionsContextValue = {
  retryNode: (nodeId: string) => void | Promise<void>;
};

const NodeActionsContext = React.createContext<NodeActionsContextValue | null>(
  null,
);

export function NodeActionsProvider({
  children,
  retryNode,
}: {
  children: React.ReactNode;
  retryNode: (nodeId: string) => void | Promise<void>;
}) {
  const value = React.useMemo<NodeActionsContextValue>(
    () => ({ retryNode }),
    [retryNode],
  );
  return (
    <NodeActionsContext.Provider value={value}>
      {children}
    </NodeActionsContext.Provider>
  );
}

export function useNodeActions(): NodeActionsContextValue {
  const ctx = React.useContext(NodeActionsContext);
  if (!ctx) throw new Error("useNodeActions must be used within NodeActionsProvider");
  return ctx;
}

