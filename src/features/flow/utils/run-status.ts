import type { Node } from "@xyflow/react";
import type { NodeData } from "@/features/flow/types/nodes";

export type RunStatus = NonNullable<NodeData["runStatus"]>;

export function markAllNodesStatus(
  nodes: Node<NodeData>[],
  status: RunStatus,
): Node<NodeData>[] {
  return nodes.map((node) => ({
    ...node,
    data: { ...node.data, runStatus: status },
  }));
}

export function markNodesStatus(
  nodes: Node<NodeData>[],
  ids: Set<string>,
  status: RunStatus,
): Node<NodeData>[] {
  return nodes.map((node) =>
    ids.has(node.id)
      ? { ...node, data: { ...node.data, runStatus: status } }
      : node,
  );
}

export const markRunning = (nodes: Node<NodeData>[], ids: Set<string>) =>
  markNodesStatus(nodes, ids, "running");

export const markSuccess = (nodes: Node<NodeData>[], ids: Set<string>) =>
  markNodesStatus(nodes, ids, "success");

export const markFailed = (nodes: Node<NodeData>[], ids: Set<string>) =>
  markNodesStatus(nodes, ids, "failed");
