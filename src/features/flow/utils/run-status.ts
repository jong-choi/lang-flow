import type { SchemaNode } from "@/features/flow/types/nodes";

export const RUN_STATUS = {
  IDLE: "idle",
  RUNNING: "running",
  SUCCESS: "success",
  FAILED: "failed",
} as const;

export type RunStatus = (typeof RUN_STATUS)[keyof typeof RUN_STATUS];

export function markAllNodesStatus(
  nodes: SchemaNode[],
  status: RunStatus,
): SchemaNode[] {
  return nodes.map((node) => ({
    ...node,
    data: { ...node.data, runStatus: status },
  }));
}

export function markNodesStatus(
  nodes: SchemaNode[],
  ids: Set<string>,
  status: RunStatus,
): SchemaNode[] {
  return nodes.map((node) =>
    ids.has(node.id)
      ? { ...node, data: { ...node.data, runStatus: status } }
      : node,
  );
}

export const markRunning = (nodes: SchemaNode[], ids: Set<string>) =>
  markNodesStatus(nodes, ids, RUN_STATUS.RUNNING);

export const markSuccess = (nodes: SchemaNode[], ids: Set<string>) =>
  markNodesStatus(nodes, ids, RUN_STATUS.SUCCESS);

export const markFailed = (nodes: SchemaNode[], ids: Set<string>) =>
  markNodesStatus(nodes, ids, RUN_STATUS.FAILED);
