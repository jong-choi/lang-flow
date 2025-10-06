import type {
  FlowEdgeInsert,
  FlowNodeInsert,
  NodeData,
  SchemaEdge,
  SchemaNode,
} from "@/features/flow/types/graph";
import type {
  WorkflowDetail,
  WorkflowSummary,
} from "@/features/flow/types/workflow";
import type { WorkflowApiDetail } from "@/features/flow/types/workflow-api";

const toNodeData = (value?: Record<string, unknown> | null): NodeData => {
  if (!value) return { label: "", emoji: "", job: "" };
  return value as NodeData;
};

export const mapRowToSchemaNode = (row: FlowNodeInsert): SchemaNode => ({
  id: row.id || "",
  type: row.type,
  position: {
    x: row.posX ?? 0,
    y: row.posY ?? 0,
  },
  data: toNodeData(row.data ?? undefined),
});

export const mapRowToSchemaEdge = (row: FlowEdgeInsert): SchemaEdge => ({
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
): WorkflowDetail => {
  const fallbackOwnership =
    detail.isOwner === true
      ? "owner"
      : detail.isLicensed === true
        ? "licensed"
        : "owner";
  const ownership = detail.ownership ?? fallbackOwnership;
  const isOwner = detail.isOwner ?? ownership === "owner";
  const isLicensed = detail.isLicensed ?? ownership === "licensed";

  return {
    id: detail.id,
    name: detail.name,
    description: detail.description ?? null,
    updatedAt: detail.updatedAt ?? null,
    ownership,
    isOwner,
    isLicensed,
    nodes: (detail.nodes ?? []).map((node) => ({
      id: node.id ?? "",
      type: node.type,
      position: {
        x: node.posX ?? 0,
        y: node.posY ?? 0,
      },
      data: toNodeData(node.data ?? undefined),
    })),
    edges: (detail.edges ?? []).map((edge) => ({
      id: edge.id ?? "",
      source: edge.sourceId,
      target: edge.targetId,
      sourceHandle: edge.sourceHandle ?? undefined,
      targetHandle: edge.targetHandle ?? undefined,
      label: edge.label ?? undefined,
      type: "custom",
    })),
  };
};

export const serializeNodeForApi = (node: SchemaNode) => ({
  id: node.id,
  type: node.type,
  posX: node.position.x,
  posY: node.position.y,
  data: (node.data as Record<string, unknown>) ?? null,
});

export const serializeEdgeForApi = (edge: SchemaEdge) => ({
  id: edge.id,
  sourceId: edge.source,
  targetId: edge.target,
  sourceHandle: edge.sourceHandle ?? null,
  targetHandle: edge.targetHandle ?? null,
  label: edge.label ?? null,
  order: null,
});

export const toWorkflowSummary = (
  detail: WorkflowApiDetail,
): WorkflowSummary => {
  const fallbackOwnership =
    detail.isOwner === true
      ? "owner"
      : detail.isLicensed === true
        ? "licensed"
        : "owner";
  const ownership = detail.ownership ?? fallbackOwnership;
  const isOwner = detail.isOwner ?? ownership === "owner";
  const isLicensed = detail.isLicensed ?? ownership === "licensed";

  return {
    id: detail.id,
    name: detail.name,
    description: detail.description ?? null,
    updatedAt: detail.updatedAt ?? null,
    ownership,
    isOwner,
    isLicensed,
  };
};
