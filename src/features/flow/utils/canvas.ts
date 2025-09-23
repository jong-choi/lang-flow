import type {
  SchemaEdge,
  SchemaNode,
  WorkflowTemplateDetail,
} from "@/features/flow/types/nodes";

interface Position {
  x: number;
  y: number;
}

export interface TemplateGroup {
  id: string;
  label: string;
  nodeIds: string[];
}

export interface TemplateInsertionGenerators {
  generateNodeId: () => string;
  generateEdgeId: () => string;
  generateGroupId: () => string;
}

export interface TemplateInsertionResult {
  nodesToAdd: SchemaNode[];
  edgesToAdd: SchemaEdge[];
  group: TemplateGroup;
}

export const createRandomEdgeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `edge_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const createRandomGroupId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `group_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

interface TemplateBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const INITIAL_NODE_BLUEPRINTS: Array<
  Pick<SchemaNode, "id" | "type" | "position">
> = [
  {
    id: "1",
    type: "inputNode",
    position: { x: 250, y: 25 },
  },
];

const DEFAULT_NODE_RUN_STATUS: SchemaNode["data"]["runStatus"] = "idle";

const getTemplateBounds = (nodes: SchemaNode[]): TemplateBounds => {
  const xs = nodes.map((node) => node.position.x);
  const ys = nodes.map((node) => node.position.y);

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
};

const getTemplateCenter = (bounds: TemplateBounds) => ({
  x: bounds.minX + (bounds.maxX - bounds.minX) / 2,
  y: bounds.minY + (bounds.maxY - bounds.minY) / 2,
});

export const createDefaultNodes = (
  createNodeData: (type: SchemaNode["type"]) => SchemaNode["data"],
): SchemaNode[] =>
  INITIAL_NODE_BLUEPRINTS.map((blueprint) => ({
    ...blueprint,
    position: { ...blueprint.position },
    data: { ...createNodeData(blueprint.type) },
  }));

export const duplicateNodes = (nodes: SchemaNode[]): SchemaNode[] =>
  nodes.map((node) => ({
    ...node,
    position: { ...node.position },
    data: { ...node.data },
  }));

export const duplicateEdges = (edges: SchemaEdge[]): SchemaEdge[] =>
  edges.map((edge) => ({ ...edge }));

export const calculateTemplateInsertion = (
  template: WorkflowTemplateDetail,
  dropPosition: Position,
  generators: TemplateInsertionGenerators,
): TemplateInsertionResult | null => {
  const templateNodes = template.nodes.filter(
    (node) => node.type !== "inputNode" && node.type !== "outputNode",
  );

  if (templateNodes.length === 0) {
    return null;
  }

  const bounds = getTemplateBounds(templateNodes);
  const center = getTemplateCenter(bounds);
  const offsetX = dropPosition.x - center.x;
  const offsetY = dropPosition.y - center.y;
  const idMap = new Map<string, string>();

  const nodesToAdd = templateNodes.map((node) => {
    const newId = generators.generateNodeId();
    idMap.set(node.id, newId);

    return {
      ...node,
      id: newId,
      position: {
        x: node.position.x + offsetX,
        y: node.position.y + offsetY,
      },
      data: {
        ...node.data,
        runStatus: DEFAULT_NODE_RUN_STATUS,
      },
    } satisfies SchemaNode;
  });

  const edgesToAdd = template.edges
    .filter((edge) => idMap.has(edge.source) && idMap.has(edge.target))
    .map((edge) => ({
      ...edge,
      id: generators.generateEdgeId(),
      source: idMap.get(edge.source)!,
      target: idMap.get(edge.target)!,
      type: edge.type ?? "custom",
    }));

  return {
    nodesToAdd,
    edgesToAdd,
    group: {
      id: generators.generateGroupId(),
      label: template.name,
      nodeIds: nodesToAdd.map((node) => node.id),
    },
  };
};

export const markRunningNodesAsFailed = (nodes: SchemaNode[]): SchemaNode[] =>
  nodes.map((node) =>
    node.data.runStatus === "running"
      ? {
          ...node,
          data: {
            ...node.data,
            runStatus: "failed",
          },
        }
      : node,
  );

export const pruneEmptyTemplateGroups = (
  groups: TemplateGroup[],
  nodes: SchemaNode[],
): TemplateGroup[] => {
  const nodeIds = new Set(nodes.map((node) => node.id));

  return groups
    .map((group) => ({
      ...group,
      nodeIds: group.nodeIds.filter((id) => nodeIds.has(id)),
    }))
    .filter((group) => group.nodeIds.length > 0);
};

export const buildNewNode = (
  type: SchemaNode["type"],
  position: Position,
  generateNodeId: () => string,
  createNodeData: (type: SchemaNode["type"]) => SchemaNode["data"],
): SchemaNode => ({
  id: generateNodeId(),
  type,
  position,
  data: createNodeData(type),
});
