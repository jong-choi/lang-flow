import type { BaseMessage } from "@langchain/core/messages";
import {
  Annotation,
  END,
  MemorySaver,
  START,
  StateGraph,
  messagesStateReducer,
} from "@langchain/langgraph";
import { branchNode } from "@/app/api/flow/_engine/nodes/branch-node";
import { chatNode } from "@/app/api/flow/_engine/nodes/chat-node";
import { googleSearchNode } from "@/app/api/flow/_engine/nodes/google-search-node";
import { inputNode } from "@/app/api/flow/_engine/nodes/input-node";
import { mergeNode } from "@/app/api/flow/_engine/nodes/merge-node";
import { messageNode } from "@/app/api/flow/_engine/nodes/message-node";
import { outputNode } from "@/app/api/flow/_engine/nodes/output-node";
import type {
  FlowState,
  LangGraphNodeType,
} from "@/features/flow/types/execution";
import type { SchemaEdge, SchemaNode } from "@/features/flow/types/graph";

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
function determineNodeType(node: SchemaNode): LangGraphNodeType {
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
  if (node.data.job === "프롬프트" || node.data.job === "메시지") {
    return "message";
  }
  if (node.data.job === "분기") {
    return "branch";
  }
  if (node.data.job === "합성") {
    return "merge";
  }

  return "message";
}

// React Flow를 LangGraph로 변환
/**
 * 분기 노드의 대상 노드들을 찾는 헬퍼 함수
 */
function findBranchTargets(nodeId: string, edges: SchemaEdge[]): string[] {
  return edges
    .filter((edge) => edge.source === nodeId)
    .map((edge) => edge.target);
}

/**
 * 병합 노드의 입력 노드들을 찾는 헬퍼 함수
 */
function findMergeInputs(nodeId: string, edges: SchemaEdge[]): string[] {
  return edges
    .filter((edge) => edge.target === nodeId)
    .map((edge) => edge.source);
}

export function buildGraphFromFlow(
  reactFlowNodes: SchemaNode[],
  reactFlowEdges: SchemaEdge[],
) {
  const graph = new StateGraph(FlowStateAnnotation);
  const typeMap: Record<string, LangGraphNodeType> = {};

  // 노드들을 추가
  for (const reactNode of reactFlowNodes) {
    const nodeType = determineNodeType(reactNode);
    const nodeId = reactNode.id;
    typeMap[nodeId] = nodeType;

    switch (nodeType) {
      case "input":
        graph.addNode(nodeId, inputNode);
        break;
      case "output":
        graph.addNode(nodeId, outputNode);
        break;
      case "chat":
        graph.addNode(nodeId, async (state) =>
          chatNode(state, {
            nodeId,
            model:
              typeof reactNode.data.model === "string"
                ? reactNode.data.model
                : undefined,
          }),
        );
        break;
      case "google_search":
        graph.addNode(nodeId, googleSearchNode);
        break;
      case "message":
        // messageNode는 템플릿 파라미터가 필요하므로 wrapper 함수 생성
        graph.addNode(nodeId, async (state) => {
          const templateData = reactNode.data.template;
          const template =
            typeof templateData === "string" && templateData.length > 0
              ? templateData
              : undefined;
          return messageNode(state, nodeId, template);
        });
        break;
      case "branch":
        // 분기 노드의 대상들을 찾아서 전달
        const branchTargets = findBranchTargets(nodeId, reactFlowEdges);
        graph.addNode(nodeId, async (state) => {
          return branchNode(state, nodeId, branchTargets);
        });
        break;
      case "merge":
        // 병합 노드의 입력들을 찾아서 전달
        const mergeInputs = findMergeInputs(nodeId, reactFlowEdges);
        graph.addNode(nodeId, async (state) => {
          return mergeNode(state, nodeId, mergeInputs);
        });
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

  const compiled = graph.compile({ checkpointer });
  return { graph: compiled, typeMap };
}
