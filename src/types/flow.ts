import type { BaseMessage } from "@langchain/core/messages";

export type NodeId = string;
export type SessionId = string;
export type Timestamp = string;

export interface Position {
  x: number;
  y: number;
}
export type LangGraphNodeType = "chat" | "google_search" | "input" | "output";

export interface BaseNodeData {
  label: string;
  emoji: string;
  job: string;
  prompt?: string;
  model?: string;
  [key: string]: unknown;
}

export interface ReactFlowNode {
  id: NodeId;
  type: string;
  position: Position;
  data: BaseNodeData;
}

export interface ReactFlowEdge {
  id: string;
  source: NodeId;
  target: NodeId;
  sourceHandle?: string;
  targetHandle?: string;
}
interface BaseEvent {
  type: string;
  timestamp: Timestamp;
}

interface BaseNodeEvent extends BaseEvent {
  nodeId: NodeId;
  nodeName: string;
}

export interface NodeStartEvent extends BaseNodeEvent {
  type: "node_start";
}

export interface NodeCompleteEvent extends BaseNodeEvent {
  type: "node_complete";
  result: unknown;
}

export interface NodeErrorEvent extends BaseNodeEvent {
  type: "node_error";
  error: string;
}

export interface FlowCompleteEvent extends BaseEvent {
  type: "flow_complete";
  result: unknown;
}

export interface FlowErrorEvent extends BaseEvent {
  type: "flow_error";
  error: string;
}

export type StreamingEvent =
  | NodeStartEvent
  | NodeCompleteEvent
  | NodeErrorEvent
  | FlowCompleteEvent
  | FlowErrorEvent;
export interface FlowState {
  messages: BaseMessage[];
  prompt: string;
  currentNodeId?: NodeId;
  searchResults?: unknown[];
  finalResult?: unknown;
  nodeOutputs: Record<NodeId, unknown>;
}

export interface NodeExecutionContext {
  nodeId: NodeId;
  nodeType: LangGraphNodeType;
  prompt: string;
  previousOutputs: Record<NodeId, unknown>;
  sessionId: SessionId;
}
export interface FlowExecutionRequest {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  prompt: string;
}

interface BaseFlowExecutionResponse {
  sessionId: SessionId;
}

interface FlowExecutionSuccessResponse extends BaseFlowExecutionResponse {
  success: true;
  events: StreamingEvent[];
}

interface FlowExecutionErrorResponse extends BaseFlowExecutionResponse {
  success: false;
  error: string;
  details?: string;
}

export type FlowExecutionResponse =
  | FlowExecutionSuccessResponse
  | FlowExecutionErrorResponse;
