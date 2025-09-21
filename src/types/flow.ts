import type { BaseMessage } from "@langchain/core/messages";

export type NodeId = string;
export type SessionId = string;
export type Timestamp = string;

export interface Position {
  x: number;
  y: number;
}
export type LangGraphNodeType =
  | "chat"
  | "google_search"
  | "input"
  | "output"
  | "message"
  | "branch"
  | "merge";

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

export interface FlowEventBase {
  nodeId: string;
  event: string;
  message?: string;
  data?: unknown;
  error?: string;
}

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
  [key: string]: unknown;
}

export interface FlowState {
  messages: BaseMessage[];
  prompt: string;
  currentNodeId?: NodeId;
  searchResults?: unknown[];
  finalResult?: unknown;
  nodeOutputs: Record<NodeId, NodeOutput>;
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
  events: FlowEventBase[];
}

interface FlowExecutionErrorResponse extends BaseFlowExecutionResponse {
  success: false;
  error: string;
  details?: string;
}

export type FlowExecutionResponse =
  | FlowExecutionSuccessResponse
  | FlowExecutionErrorResponse;
