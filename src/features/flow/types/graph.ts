import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type {
  Edge as XYFlowEdge,
  Node as XYFlowNode,
  XYPosition,
} from "@xyflow/react";
import type { flowEdges, flowNodes } from "@/features/flow/db/schema";

type Primitive = string | number | boolean | null | undefined;
type SimpleValue = Exclude<Primitive, null>;

export type FlowNodeRow = InferSelectModel<typeof flowNodes>;
export type FlowEdgeRow = InferSelectModel<typeof flowEdges>;
export type FlowNodeInsert = InferInsertModel<typeof flowNodes>;
export type FlowEdgeInsert = InferInsertModel<typeof flowEdges>;

export type FlowNodeId = FlowNodeRow["id"];
export type FlowEdgeId = FlowEdgeRow["id"];
export type FlowNodeType = FlowNodeRow["type"];

export interface BaseNodeData {
  label: string;
  emoji: string;
  job: string;
  prompt?: string;
  model?: string;
  showInResults?: boolean;
  nodeType?: FlowNodeType;
  runStatus?: "idle" | "running" | "success" | "failed";
  level?: number;
}

export type NodeData = BaseNodeData & Record<string, SimpleValue>;

export interface SchemaNode
  extends Omit<
    XYFlowNode<NodeData, FlowNodeType>,
    "type" | "data" | "position"
  > {
  id: FlowNodeId;
  type: FlowNodeType;
  position: XYPosition;
  data: NodeData;
}

export interface SchemaEdge
  extends Omit<
    XYFlowEdge,
    "id" | "source" | "target" | "sourceHandle" | "targetHandle" | "label"
  > {
  id: FlowEdgeRow["id"];
  source: FlowEdgeRow["sourceId"];
  target: FlowEdgeRow["targetId"];
  sourceHandle?: FlowEdgeRow["sourceHandle"] | undefined;
  targetHandle?: FlowEdgeRow["targetHandle"] | undefined;
  label?: FlowEdgeRow["label"] | undefined;
}
