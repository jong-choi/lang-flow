"use client";

import React from "react";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";
import type {
  FlowEvent,
  FlowExecutionRequest,
} from "@/features/flow/types/execution";
import type { SchemaEdge, SchemaNode } from "@/features/flow/types/graph";
import { computeLevels as computeLevelsGraph } from "@/features/flow/utils/graph";
import {
  RUN_STATUS,
  markAllNodesStatus,
  markFailed,
  markRunning,
  markSuccess,
} from "@/features/flow/utils/run-status";

type SetNodes = React.Dispatch<React.SetStateAction<SchemaNode[]>>;
type SetEdges = React.Dispatch<React.SetStateAction<SchemaEdge[]>>;

type UseFlowExecutionParams = {
  setNodes: SetNodes;
  setEdges: SetEdges;
  setIsRunning: (isRunning: boolean) => void;
  setLevels: (levels: string[][]) => void;
  setFailedNodeIds: (failedNodeIds: Set<string>) => void;
  setFailedCount: (failedCount: number) => void;
  setCurrentLevelIndex: (levelIndex: number) => void;
  onComplete?: () => void;
};

export function useFlowExecution({
  setNodes,
  setEdges,
  setIsRunning,
  setLevels,
  setFailedNodeIds,
  setFailedCount,
  setCurrentLevelIndex,
  onComplete,
}: UseFlowExecutionParams) {
  const isRunning = useFlowGeneratorStore.use.isRunning();
  const failedNodeIds = useFlowGeneratorStore.use.failedNodeIds();

  // 로컬 스트리밍 상태 (이벤트 로그 제거)
  const [error, setError] = React.useState<string | null>(null);
  const [sessionId, setSessionId] = React.useState<string | null>(null);

  // 결과물 및 완료 상태
  type ResultEntry = { nodeId: string; nodeType: string; text: string };
  const [results, setResults] = React.useState<ResultEntry[]>([]);
  const [flowCompleted, setFlowCompleted] = React.useState(false);

  const levelsRef = React.useRef<string[][]>([]);
  const isCancelledRef = React.useRef(false);
  const sseAbortRef = React.useRef<AbortController | null>(null);
  const lastRequestRef = React.useRef<{
    prompt: string;
    nodes: SchemaNode[];
    edges: SchemaEdge[];
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
    (event: FlowEvent) => {
      const nodeId = event.nodeId;
      const eventType = event.event;

      switch (eventType) {
        case "flow_start": {
          setFlowCompleted(false);
          return;
        }
        case "flow_complete": {
          setIsRunning(false);
          setEdgesDashed(false);
          setFlowCompleted(true);
          onComplete?.();
          setSessionId(event.data?.sessionId || "");
          return;
        }
        case "flow_error": {
          setError(event.error || "플로우 실행 오류");
          setIsRunning(false);
          setEdgesDashed(false);
          setFlowCompleted(false);
          return;
        }
        case "node_start": {
          if (nodeId && !seenRunningRef.current.has(nodeId)) {
            seenRunningRef.current.add(nodeId);
            setNodes((nodes) => markRunning(nodes, new Set([nodeId])));
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
            updateCurrentLevelByNode(nodeId);
          }
          return;
        }
        case "node_streaming": {
          if (nodeId) {
            const streamingData = event.data;
            if (streamingData && streamingData.content) {
              const nodeType = event.nodeType ?? "unknown";
              setResults((previousResults) => {
                const existingNodeIndex = previousResults.findIndex(
                  (result) => result.nodeId === nodeId,
                );

                if (existingNodeIndex === -1) {
                  return [
                    ...previousResults,
                    { nodeId, nodeType, text: streamingData.content },
                  ];
                }

                const updatedResults = [...previousResults];
                const existingResult = updatedResults[existingNodeIndex];

                updatedResults[existingNodeIndex] = {
                  ...existingResult,
                  nodeType: existingResult.nodeType || nodeType,
                  text: existingResult.text + streamingData.content,
                };
                return updatedResults;
              });
            }
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
            updateCurrentLevelByNode(nodeId);
          } else {
            setError(event.error || "노드 오류");
          }
          return;
        }
      }
    },
    [
      failedNodeIds,
      setEdgesDashed,
      setFailedCount,
      setFailedNodeIds,
      setIsRunning,
      setNodes,
      updateCurrentLevelByNode,
      onComplete,
    ],
  );

  const runFlow = React.useCallback(
    async (
      prompt: string,
      inputNodes: SchemaNode[],
      inputEdges: SchemaEdge[],
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
        setError(null);
        setSessionId(null);
        setResults([]);
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
            type: node.type,
            position: node.position,
            data: {
              ...node.data,
              label: String(node.data?.label ?? ""),
              emoji: String(node.data?.emoji ?? ""),
              job: String(node.data?.job ?? ""),
              showInResults: node.data?.showInResults,
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

              if (
                data &&
                typeof data === "object" &&
                "event" in data &&
                "nodeId" in data
              ) {
                handleFlowEvent(data as FlowEvent);
              }
            } catch (parseError) {
              console.warn("이벤트 파싱 실패:", parseError);
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
        } else {
          const errorMessage =
            error instanceof Error ? error.message : String(error ?? "오류");
          setError(errorMessage);
        }
      } finally {
        sseAbortRef.current = null;
        setIsRunning(false);
        setEdgesDashed(false);
      }
    },
    [
      setEdgesDashed,
      setFailedCount,
      setFailedNodeIds,
      setIsRunning,
      setLevels,
      setNodes,
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

  const retryNode = React.useCallback(async () => {
    if (isRunning) return;
    const lastRequest = lastRequestRef.current;
    if (!lastRequest) return;
    await runFlow(lastRequest.prompt, lastRequest.nodes, lastRequest.edges);
  }, [isRunning, runFlow]);

  const retryLevel = React.useCallback(async () => {
    if (isRunning) return;
    const lastRequest = lastRequestRef.current;
    if (!lastRequest) return;
    await runFlow(lastRequest.prompt, lastRequest.nodes, lastRequest.edges);
  }, [isRunning, runFlow]);

  return {
    runFlow,
    cancelAll,
    retryNode,
    retryLevel,
    error,
    sessionId,
    results,
    flowCompleted,
  } as const;
}
