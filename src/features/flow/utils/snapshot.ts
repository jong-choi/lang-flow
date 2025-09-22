import type { SchemaEdge, SchemaNode } from "@/features/flow/types/nodes";

export function buildSnapshot(nodes: SchemaNode[], edges: SchemaEdge[]) {
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
