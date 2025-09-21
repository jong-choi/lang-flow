import type { BaseMessage } from "@langchain/core/messages";
import {
  Annotation,
  END,
  MemorySaver,
  START,
  StateGraph,
  messagesStateReducer,
} from "@langchain/langgraph";
import type {
  FlowState,
  LangGraphNodeType,
  ReactFlowEdge,
  ReactFlowNode,
} from "@/types/flow";
import { chatNode } from "./nodes/chat-node";
import { googleSearchNode } from "./nodes/google-search-node";
import { inputNode } from "./nodes/input-node";
import { outputNode } from "./nodes/output-node";

// 이 파일은 중앙의 FlowState 타입을 재사용합니다.
// nodeOutputs와 finalResult는 이미 `src/types/flow.ts`의 `FlowState`에서
// `unknown`으로 정의되어 있어, 개별 노드가 다양한 형태의 출력을 기록할 수 있습니다.

// LangGraph 상태 어노테이션 정의
export const FlowStateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    default: () => [],
    reducer: messagesStateReducer,
  }),
  prompt: Annotation<string>({
    default: () => "",
    reducer: (_, update) => update,
  }),
  currentNodeId: Annotation<string | undefined>({
    default: () => undefined,
    reducer: (_, update) => update,
  }),
  searchResults: Annotation<FlowState["searchResults"]>({
    default: () => [],
    reducer: (_, update) => update,
  }),
  finalResult: Annotation<FlowState["finalResult"]>({
    default: () => null,
    reducer: (_, update) => update,
  }),
  nodeOutputs: Annotation<FlowState["nodeOutputs"]>({
    default: () => ({}),
    reducer: (current, update) => ({ ...current, ...update }),
  }),
});

export const checkpointer = new MemorySaver();

// 타입 이름 파싱하는 함수
function determineNodeType(node: ReactFlowNode): LangGraphNodeType {
  if (node.type === "inputNode") return "input";
  if (node.type === "outputNode") return "output";
  if (node.data.job === "chat" || node.data.job === "채팅") {
    return "chat";
  }
  if (
    node.data.job === "search" ||
    node.data.job === "구글검색" ||
    node.data.job === "검색"
  ) {
    return "google_search";
  }

  return "chat";
}

// React Flow를 LangGraph로 변환
export function buildGraphFromFlow(
  reactFlowNodes: ReactFlowNode[],
  reactFlowEdges: ReactFlowEdge[],
) {
  const graph = new StateGraph(FlowStateAnnotation);

  // 노드들을 추가
  for (const reactNode of reactFlowNodes) {
    const nodeType = determineNodeType(reactNode);
    const nodeId = reactNode.id;

    switch (nodeType) {
      case "input":
        graph.addNode(nodeId, inputNode);
        break;
      case "output":
        graph.addNode(nodeId, outputNode);
        break;
      case "chat":
        graph.addNode(nodeId, chatNode);
        break;
      case "google_search":
        graph.addNode(nodeId, googleSearchNode);
        break;
    }
  }

  // addEdge 라이브러리에 타입 없어서 lint 비활성화
  for (const edge of reactFlowEdges) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graph.addEdge(edge.source as any, edge.target as any);
  }

  // 시작 노드 찾기 (input 타입이거나 incoming edge가 없는 노드)
  const incomingEdges = new Set(reactFlowEdges.map((e) => e.target));
  let startNode = reactFlowNodes.find(
    (node) =>
      determineNodeType(node) === "input" || !incomingEdges.has(node.id),
  );

  if (!startNode && reactFlowNodes.length > 0) {
    startNode = reactFlowNodes[0]; // 폴백: 첫 번째 노드
  }

  if (startNode) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graph.addEdge(START, startNode.id as any);
  }

  // 끝 노드 찾기 (output 타입이거나 outgoing edge가 없는 노드)
  const outgoingEdges = new Set(reactFlowEdges.map((e) => e.source));
  const endNodes = reactFlowNodes.filter(
    (node) =>
      determineNodeType(node) === "output" || !outgoingEdges.has(node.id),
  );

  for (const endNode of endNodes) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graph.addEdge(endNode.id as any, END);
  }

  return graph.compile({ checkpointer });
}

// 그래프 실행 및 스트리밍
export async function* executeGraph(
  compiledGraph: ReturnType<typeof StateGraph.prototype.compile>,
  prompt: string,
  sessionId: string,
) {
  const config = {
    configurable: { thread_id: sessionId },
    streamMode: "values" as const,
  };

  const initialState: FlowState = {
    messages: [],
    prompt,
    currentNodeId: undefined,
    searchResults: [],
    finalResult: null,
    nodeOutputs: {},
  };

  try {
    for await (const event of await compiledGraph.stream(
      initialState,
      config,
    )) {
      yield event;
    }
  } catch (error) {
    console.error("Graph execution error:", error);
    throw error;
  }
}
