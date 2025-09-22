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
  showInResults?: boolean;
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

export interface EventData {
  flow_start: {
    sessionId: SessionId;
  };
  flow_complete: {
    sessionId: SessionId;
  };
  flow_error: never;
  node_start: never;
  node_complete: never;
  node_streaming: {
    content: string;
  };
  node_error: never;
}

export type FlowEventType = keyof EventData;

export interface FlowEvent<T extends FlowEventType = FlowEventType> {
  nodeId: string;
  event: T;
  message?: string;
  data?: EventData[T];
  error?: string;
  nodeType?: string;
}

export type FlowEventUnion =
  | FlowEvent<"flow_start">
  | FlowEvent<"flow_complete">
  | FlowEvent<"flow_error">
  | FlowEvent<"node_start">
  | FlowEvent<"node_complete">
  | FlowEvent<"node_streaming">
  | FlowEvent<"node_error">;

export type FlowEventBase =
  | ({
      nodeId: string;
      event: "flow_start";
      message?: string;
      error?: string;
      nodeType?: string;
    } & {
      data: EventData["flow_start"];
    })
  | ({
      nodeId: string;
      event: "flow_complete";
      message?: string;
      error?: string;
      nodeType?: string;
    } & {
      data: EventData["flow_complete"];
    })
  | ({
      nodeId: string;
      event: "node_streaming";
      message?: string;
      error?: string;
      nodeType?: string;
    } & {
      data: EventData["node_streaming"];
    })
  | {
      nodeId: string;
      event: "flow_error";
      message?: string;
      error?: string;
      nodeType?: string;
    }
  | {
      nodeId: string;
      event: "node_start";
      message?: string;
      error?: string;
      nodeType?: string;
    }
  | {
      nodeId: string;
      event: "node_complete";
      message?: string;
      error?: string;
      nodeType?: string;
    }
  | {
      nodeId: string;
      event: "node_error";
      message?: string;
      error?: string;
      nodeType?: string;
    };

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
