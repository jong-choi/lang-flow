import type { Edge, Node } from "@xyflow/react";
import type { NodeData } from "@/features/flow/types/nodes";

export function buildSnapshot(nodes: Node<NodeData>[], edges: Edge[]) {
  const nodePayload = nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.data,
  }));
  const edgePayload = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
  }));
  return { nodes: nodePayload, edges: edgePayload };
}
