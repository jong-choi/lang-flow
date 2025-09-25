import type { BaseMessage } from "@langchain/core/messages";
import type {
  NodeId,
  ReactFlowEdge,
  ReactFlowNode,
} from "@/features/flow/types/graph";

type Primitive = string | number | boolean | null | undefined;
type ComplexValue = Primitive | object;

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

export type LangGraphNodeType =
  | "chat"
  | "google_search"
  | "input"
  | "output"
  | "message"
  | "branch"
  | "merge";
