/** 최소 주석, 한 파일 SSOT */
import type { CSSProperties, ComponentType } from "react";
import type { InferSelectModel } from "drizzle-orm";
import type { BaseMessage } from "@langchain/core/messages";
import type {
  Position,
  Edge as XYFlowEdge,
  Node as XYFlowNode,
} from "@xyflow/react";
import type { flowEdges, flowNodes } from "@/features/flow/db/schema";

// ============= 기본 원시 타입 =============
type Primitive = string | number | boolean | null | undefined;
type SimpleValue = Exclude<Primitive, null>;
type ComplexValue = Primitive | object;

// ============= DB 스키마 타입 =============
type FlowNodeRow = InferSelectModel<typeof flowNodes>;
type FlowEdgeRow = InferSelectModel<typeof flowEdges>;
type NodeId = FlowNodeRow["id"];
export type FlowNodeType = FlowNodeRow["type"];

// ============= 좌표 및 위치 =============
interface Position2D {
  x: number;
  y: number;
}

// ============= 노드 데이터 =============
interface BaseNodeData {
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

export interface NodeData extends BaseNodeData {
  [key: string]: SimpleValue;
}

// ============= 노드 및 엣지 정의 =============
export interface SchemaNode extends Omit<XYFlowNode, "type" | "data"> {
  type: FlowNodeType;
  data: NodeData;
}

export interface SchemaEdge extends XYFlowEdge {
  id: FlowEdgeRow["id"];
  source: FlowEdgeRow["sourceId"];
  target: FlowEdgeRow["targetId"];
}

export interface ReactFlowNode {
  id: NodeId;
  type: FlowNodeType;
  position: Position2D;
  data: NodeData;
}

export interface ReactFlowEdge extends SchemaEdge {
  sourceHandle?: FlowEdgeRow["sourceHandle"];
  targetHandle?: FlowEdgeRow["targetHandle"];
  label?: FlowEdgeRow["label"];
}

// ============= 노드 설정 =============
export interface NodeConfig {
  gradient: string;
  border: string;
  hoverBorder: string;
  iconColor: string;
  hoverBg: string;
  emojiGradient: string;
}

export interface NodeTypeConfig {
  emoji: string;
  job: string;
  label: string;
  showInResults?: boolean;
}

export interface SidebarItemConfig {
  type: FlowNodeType;
  name: string;
  description: string;
  iconBg: string;
}

// ============= 연결 관련 =============
export interface ConnectionLimit {
  id: NodeId;
  max: number;
}

export interface ConnectionLimits {
  inputs?: ConnectionLimit[];
  outputs?: ConnectionLimit[];
}

export interface ConnectionState {
  current: number;
  max: number;
  isConnectable: boolean;
}

export type ConnectionStateMap = Record<NodeId, ConnectionState>;

export interface HandleDefinition {
  type: "source" | "target";
  position: Position;
  id: NodeId;
  size?: "large" | "small";
  style?: CSSProperties;
}

// ============= 이벤트 시스템 =============
interface FlowEventBase {
  nodeId: NodeId;
  event: string;
  message?: string;
  error?: string;
  nodeType?: string;
}

interface FlowEventDataMap {
  flow_start: { sessionId: string };
  flow_complete: { sessionId: string };
  flow_error: never;
  node_start: never;
  node_complete: never;
  node_streaming: { content: string };
  node_error: never;
}

export type FlowEvent = FlowEventBase &
  {
    [K in keyof FlowEventDataMap]: {
      event: K;
      data?: FlowEventDataMap[K];
    };
  }[keyof FlowEventDataMap];

// ============= 플로우 실행 =============
export interface NodeOutput {
  type?: string;
  content?: string;
  rendered?: string;
  template?: string;
  input?: string;
  mergedContent?: string;
  inputNodeIds?: string[];
  inputOutputs?: string[];
  sourceNodeCount?: number;
  error?: string;
  timestamp: string;
  [key: string]: ComplexValue;
}

export interface FlowState {
  messages: BaseMessage[];
  prompt: string;
  currentNodeId?: NodeId;
  searchResults?: ComplexValue[];
  finalResult?: ComplexValue;
  nodeOutputs: Record<NodeId, NodeOutput>;
}

export interface FlowExecutionRequest {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  prompt: string;
}

// ============= UI 컴포넌트 =============
export interface NodeProps {
  data: NodeData;
  id: NodeId;
}

export interface MenuItem {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
}

// ============= 타입 분류 =============
export type LangGraphNodeType =
  | "chat"
  | "google_search"
  | "input"
  | "output"
  | "message"
  | "branch"
  | "merge";

export type MenuType = "basic" | "full";
