import type {
  FlowInsertEdgeRow,
  FlowInsertNodeRow,
  NodeData,
  ReactFlowEdge,
  SchemaEdge,
  SchemaNode,
  WorkflowTemplateDetail,
  WorkflowTemplateSummary,
} from "@/features/flow/types/nodes";

interface WorkflowApiNode {
  id: string;
  type: FlowInsertNodeRow["type"];
  posX?: number | null;
  posY?: number | null;
  data?: Record<string, unknown> | null;
}

interface WorkflowApiEdge {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  label?: string | null;
  order?: number | null;
}

interface WorkflowApiDetail {
  id: string;
  name: string;
  description?: string | null;
  updatedAt?: string | null;
  nodes?: WorkflowApiNode[];
  edges?: WorkflowApiEdge[];
}

const toNodeData = (value?: Record<string, unknown> | null): NodeData => {
  if (!value) return { label: "", emoji: "", job: "" };
  return value as NodeData;
};

export const mapRowToSchemaNode = (row: FlowInsertNodeRow): SchemaNode => ({
  id: row.id || "",
  type: row.type,
  position: {
    x: row.posX ?? 0,
    y: row.posY ?? 0,
  },
  data: toNodeData(row.data ?? undefined),
});

export const mapRowToSchemaEdge = (row: FlowInsertEdgeRow): SchemaEdge => ({
  id: row.id || "",
  source: row.sourceId,
  target: row.targetId,
  sourceHandle: row.sourceHandle ?? undefined,
  targetHandle: row.targetHandle ?? undefined,
  label: row.label ?? undefined,
  type: "custom",
});

export const deserializeWorkflowDetail = (
  detail: WorkflowApiDetail,
): WorkflowTemplateDetail => ({
  id: detail.id,
  name: detail.name,
  description: detail.description ?? null,
  updatedAt: detail.updatedAt ?? null,
  nodes: (detail.nodes ?? []).map((node) => ({
    id: node.id,
    type: node.type,
    position: {
      x: node.posX ?? 0,
      y: node.posY ?? 0,
    },
    data: toNodeData(node.data ?? undefined),
  })),
  edges: (detail.edges ?? []).map((edge) => ({
    id: edge.id,
    source: edge.sourceId,
    target: edge.targetId,
    sourceHandle: edge.sourceHandle ?? undefined,
    targetHandle: edge.targetHandle ?? undefined,
    label: edge.label ?? undefined,
    type: "custom",
  })),
});

export const serializeNodeForApi = (node: SchemaNode) => ({
  id: node.id,
  type: node.type,
  posX: node.position.x,
  posY: node.position.y,
  data: (node.data as Record<string, unknown>) ?? null,
});

export const serializeEdgeForApi = (edge: ReactFlowEdge | SchemaEdge) => ({
  id: edge.id,
  sourceId: edge.source,
  targetId: edge.target,
  sourceHandle: edge.sourceHandle ?? null,
  targetHandle: edge.targetHandle ?? null,
  label: edge.label ?? null,
  order: null,
});

export const toTemplateSummary = (
  detail: WorkflowApiDetail,
): WorkflowTemplateSummary => ({
  id: detail.id,
  name: detail.name,
  description: detail.description ?? null,
  updatedAt: detail.updatedAt ?? null,
});

export type { WorkflowApiDetail };
