"use client";

import React from "react";
import type { Edge, Node } from "@xyflow/react";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";
import type { NodeData } from "@/features/flow/types/nodes";
import { computeLevels as computeLevelsGraph } from "@/features/flow/utils/graph";
import {
  RUN_STATUS,
  markAllNodesStatus,
  markFailed,
  markRunning,
  markSuccess,
} from "@/features/flow/utils/run-status";
import type { FlowEventBase, FlowExecutionRequest } from "@/types/flow";

type SetNodes = React.Dispatch<React.SetStateAction<Node<NodeData>[]>>;
type SetEdges = React.Dispatch<React.SetStateAction<Edge[]>>;

type UseFlowExecutionParams = {
  nodes: Node<NodeData>[];
  setNodes: SetNodes;
  setEdges: SetEdges;
  addLog: (msg: string) => void;
  setIsRunning: (isRunning: boolean) => void;
  setLevels: (levels: string[][]) => void;
  setFailedNodeIds: (failedNodeIds: Set<string>) => void;
  setFailedCount: (failedCount: number) => void;
  setCurrentLevelIndex: (levelIndex: number) => void;
};

export function useFlowExecution({
  nodes,
  setNodes,
  setEdges,
  addLog,
  setIsRunning,
  setLevels,
  setFailedNodeIds,
  setFailedCount,
  setCurrentLevelIndex,
}: UseFlowExecutionParams) {
  const isRunning = useFlowGeneratorStore.use.run((state) => state.isRunning);
  const failedNodeIds = useFlowGeneratorStore.use.runMeta(
    (meta) => meta.failedNodeIds,
  );

  // 로컬 스트리밍 상태
  const [events, setEvents] = React.useState<FlowEventBase[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [sessionId, setSessionId] = React.useState<string | null>(null);

  // 결과물 및 완료 상태
  const [chatResults, setChatResults] = React.useState<Record<string, string>>(
    {},
  );
  const [flowCompleted, setFlowCompleted] = React.useState(false);

  const levelsRef = React.useRef<string[][]>([]);
  const isCancelledRef = React.useRef(false);
  const sseAbortRef = React.useRef<AbortController | null>(null);
  const lastRequestRef = React.useRef<{
    prompt: string;
    nodes: Node<NodeData>[];
    edges: Edge[];
  } | null>(null);
  const seenRunningRef = React.useRef<Set<string>>(new Set());

  const setEdgesDashed = React.useCallback(
    (dashed: boolean) => {
      setEdges((edges) =>
        edges.map((edge) => ({
          ...edge,
          style: dashed
            ? { ...edge.style, strokeDasharray: "6 3" }
            : { ...edge.style, strokeDasharray: undefined },
        })),
      );
    },
    [setEdges],
  );

  // SSE "name" (채팅 API)을 현재 그래프의 대상 노드 ID로 매핑
  const resolveNodeIdsByName = React.useCallback(
    (name: string): string[] => {
      const normalizedName = name.toLowerCase();
      // 명시적 타입/이름으로 먼저 매칭 시도
      const matchByType = nodes
        .filter((node) =>
          (node.type || "").toLowerCase().includes(normalizedName),
        )
        .map((node) => node.id);
      if (matchByType.length) return matchByType;

      // 노드 이름 매칭 시도
      const jobMap: Record<string, string[]> = {
        chatnode: ["chat", "채팅"],
        googlenode: ["google_search", "search", "구글검색", "검색"],
        googlesearchnode: ["google_search", "search", "구글검색", "검색"],
        blogsearchnode: ["search", "구글검색", "검색"],
        fetchsummarynode: ["summary", "요약"],
      };
      const keywords = jobMap[normalizedName] ?? [normalizedName];
      return nodes
        .filter((node) =>
          keywords.some((keyword) =>
            `${node.data?.job ?? ""}`.toLowerCase().includes(keyword),
          ),
        )
        .map((node) => node.id);
    },
    [nodes],
  );

  // 노드 ID 기준으로 현재 레벨 인덱스 업데이트하는 헬퍼
  const updateCurrentLevelByNode = React.useCallback(
    (nodeId: string) => {
      const levelIndex = levelsRef.current.findIndex((level) =>
        level.includes(nodeId),
      );
      if (levelIndex >= 0) setCurrentLevelIndex(levelIndex);
    },
    [setCurrentLevelIndex],
  );

  // 플로우 SSE 이벤트 처리
  const handleFlowEvent = React.useCallback(
    (
      event:
        | FlowEventBase
        | {
            nodeId: string;
            event: string;
            message?: string;
            data?: unknown;
            error?: string;
          },
    ) => {
      // 새로운 이벤트 형식을 처리
      if ("event" in event && !("type" in event)) {
        const nodeId = event.nodeId;
        const eventType = event.event;

        switch (eventType) {
          case "flow_start": {
            addLog("[run] 플로우 실행 시작");
            setFlowCompleted(false);
            return;
          }
          case "flow_complete": {
            setIsRunning(false);
            setEdgesDashed(false);
            addLog("[run] 실행 완료");
            setFlowCompleted(true);
            if (
              event.data &&
              typeof event.data === "object" &&
              "sessionId" in event.data
            ) {
              setSessionId(event.data.sessionId as string);
            }
            return;
          }
          case "flow_error": {
            setError(event.error || "플로우 실행 오류");
            setIsRunning(false);
            setEdgesDashed(false);
            addLog(`[run] 오류: ${event.error || "알 수 없는 오류"}`);
            setFlowCompleted(false);
            return;
          }
          case "node_start": {
            if (nodeId && !seenRunningRef.current.has(nodeId)) {
              seenRunningRef.current.add(nodeId);
              setNodes((nodes) => markRunning(nodes, new Set([nodeId])));
              addLog(
                `[run] 노드 ${nodeId} 시작${event.message ? `: ${event.message}` : ""}`,
              );
              updateCurrentLevelByNode(nodeId);
            }
            return;
          }
          case "node_complete": {
            if (nodeId) {
              if (!seenRunningRef.current.has(nodeId)) {
                seenRunningRef.current.add(nodeId);
                setNodes((nodes) => markRunning(nodes, new Set([nodeId])));
              }
              setNodes((nodes) => markSuccess(nodes, new Set([nodeId])));
              addLog(
                `[run] 노드 ${nodeId} 완료${event.message ? `: ${event.message}` : ""}`,
              );
              updateCurrentLevelByNode(nodeId);
            }
            return;
          }
          case "node_streaming": {
            if (
              nodeId &&
              event.data &&
              typeof event.data === "object" &&
              "content" in event.data
            ) {
              // 노드별 스트리밍 텍스트 누적 (주로 채팅 노드)
              const dataObj = event.data as unknown as { content?: unknown };
              const content =
                typeof dataObj.content === "string"
                  ? dataObj.content
                  : String(dataObj.content ?? "");
              setChatResults((prev) => ({
                ...prev,
                [nodeId]: `${prev[nodeId] ?? ""}` + content,
              }));
            }
            return;
          }
          case "node_error": {
            if (nodeId) {
              setNodes((nodes) => markFailed(nodes, new Set([nodeId])));
              const updatedFailedNodeIds = new Set(failedNodeIds);
              updatedFailedNodeIds.add(nodeId);
              setFailedNodeIds(updatedFailedNodeIds);
              setFailedCount(updatedFailedNodeIds.size);
              addLog(
                `[run] 노드 ${nodeId} 실패: ${event.error || "알 수 없는 오류"}`,
              );
              updateCurrentLevelByNode(nodeId);
            } else {
              setError(event.error || "노드 오류");
            }
            return;
          }
        }
      }
    },
    [
      addLog,
      failedNodeIds,
      setEdgesDashed,
      setFailedCount,
      setFailedNodeIds,
      setIsRunning,
      setNodes,
      updateCurrentLevelByNode,
    ],
  );

  // 채팅 SSE 처리
  const handleChatEvent = React.useCallback(
    (data: {
      name: string;
      event: string;
      message?: string;
      chunk?: { content: string };
    }) => {
      const { name, event, message } = data ?? {};
      if (!name) return;

      const targetNodeIds = resolveNodeIdsByName(String(name));
      if (!targetNodeIds.length) return;

      const nodeIdSet = new Set(targetNodeIds);
      if (event === "on_chat_model_start" || event === "status") {
        setNodes((nodes) => markRunning(nodes, nodeIdSet));
        addLog(`[run] ${name} 시작${message ? `: ${message}` : ""}`);
      } else if (event === "on_chat_model_end") {
        setNodes((nodes) => markSuccess(nodes, nodeIdSet));
        addLog(`[run] ${name} 완료`);
      }
    },
    [addLog, resolveNodeIdsByName, setNodes],
  );

  const runFlow = React.useCallback(
    async (
      prompt: string,
      inputNodes: Node<NodeData>[],
      inputEdges: Edge[],
    ) => {
      try {
        // 시작하기 시 상태 초기화
        isCancelledRef.current = false;
        seenRunningRef.current.clear();
        setIsRunning(true);
        setEdgesDashed(true);
        levelsRef.current = computeLevelsGraph(inputNodes, inputEdges);
        setLevels(levelsRef.current);
        setFailedNodeIds(new Set());
        setFailedCount(0);
        setNodes((nodes) => markAllNodesStatus(nodes, RUN_STATUS.IDLE));
        setEvents([]);
        setError(null);
        setSessionId(null);
        setChatResults({});
        setFlowCompleted(false);

        lastRequestRef.current = {
          prompt,
          nodes: inputNodes,
          edges: inputEdges,
        };

        // 요청 데이터 구성
        const requestBody: FlowExecutionRequest = {
          prompt,
          nodes: inputNodes.map((node) => ({
            id: node.id,
            type: node.type || "messageNode",
            position: node.position,
            data: {
              ...node.data,
              label: String(node.data?.label ?? ""),
              emoji: String(node.data?.emoji ?? ""),
              job: String(node.data?.job ?? ""),
            },
          })),
          edges: inputEdges.map((edge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle || undefined,
            targetHandle: edge.targetHandle || undefined,
          })),
        };

        // 스트리밍 요청 시작
        const abortController = new AbortController();
        sseAbortRef.current = abortController;

        const response = await fetch("/api/flow/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorData = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          const errorMessage = errorData?.error ?? "플로우 실행 실패";
          throw new Error(errorMessage);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("스트리밍 응답을 읽을 수 없습니다");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;

            const payload = line.slice(6);
            try {
              const data = JSON.parse(payload);

              if (data && typeof data === "object") {
                // 새로운 이벤트 형식 또는 기존 형식 모두 처리
                if ("event" in data && "nodeId" in data) {
                  // 새로운 형식: { nodeId, event, message?, data?, error? }
                  handleFlowEvent(data);
                } else if ("type" in data) {
                  // 기존 형식: { type, nodeId, ... }
                  handleFlowEvent(data as FlowEventBase);
                } else if ("name" in data) {
                  // 채팅 API 형식 (하위 호환성)
                  handleChatEvent(data);
                }
              }
            } catch (parseError) {
              console.warn("이벤트 파싱 실패:", parseError);
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          addLog("[run] 사용자가 실행을 중단했습니다");
        } else {
          const errorMessage =
            error instanceof Error ? error.message : String(error ?? "오류");
          setError(errorMessage);
          addLog(`[run] 오류: ${errorMessage}`);
        }
      } finally {
        sseAbortRef.current = null;
        setIsRunning(false);
        setEdgesDashed(false);
      }
    },
    [
      addLog,
      setEdgesDashed,
      setFailedCount,
      setFailedNodeIds,
      setIsRunning,
      setLevels,
      setNodes,
      handleChatEvent,
      handleFlowEvent,
    ],
  );

  const cancelAll = React.useCallback(() => {
    isCancelledRef.current = true;
    if (sseAbortRef.current) {
      try {
        sseAbortRef.current.abort();
      } catch (abortError) {
        console.warn("SSE 중단 중 오류:", abortError);
      }
      sseAbortRef.current = null;
    }
    setEdgesDashed(false);
    setIsRunning(false);
  }, [setEdgesDashed, setIsRunning]);

  // 각 노드별 재실행 함수 - 전체 플로우 재실행으로 처리
  const retryNode = React.useCallback(
    async (nodeId: string) => {
      if (isRunning) return;
      const lastRequest = lastRequestRef.current;
      if (!lastRequest) return;
      addLog(`[run] 노드 ${nodeId} 재시도 (전체 플로우 재실행)`);
      await runFlow(lastRequest.prompt, lastRequest.nodes, lastRequest.edges);
    },
    [addLog, isRunning, runFlow],
  );

  const retryLevel = React.useCallback(async () => {
    if (isRunning) return;
    const lastRequest = lastRequestRef.current;
    if (!lastRequest) return;
    const failedCount = failedNodeIds.size;
    addLog(`[run] 레벨 재시도 (${failedCount}개 실패) - 전체 플로우 재실행`);
    await runFlow(lastRequest.prompt, lastRequest.nodes, lastRequest.edges);
  }, [addLog, failedNodeIds.size, isRunning, runFlow]);

  return {
    // SSE + 실행 제어
    runFlow,
    cancelAll,
    retryNode,
    retryLevel,
    // 스트리밍/메타 상태
    events,
    error,
    sessionId,
    chatResults,
    flowCompleted,
    clearEvents: () => setEvents([]),
  } as const;
}
