"use client";

import React from "react";
import type { Edge, Node } from "@xyflow/react";
import type { NodeData } from "@/features/flow/types/nodes";
import { computeLevels as computeLevelsGraph } from "@/features/flow/utils/graph";
import {
  markAllNodesStatus,
  markFailed,
  markRunning,
  markSuccess,
} from "@/features/flow/utils/run-status";
import { useRunContext } from "@/features/flow/context/run-context";
import { useRunMetaContext } from "@/features/flow/context/run-meta-context";

type SetNodes = React.Dispatch<React.SetStateAction<Node<NodeData>[]>>;
type SetEdges = React.Dispatch<React.SetStateAction<Edge[]>>;

export function useRunPipeline({
  nodes,
  setNodes,
  setEdges,
  addLog,
  setIsRunning,
  setLevels,
  setFailedNodeIds,
  setFailedCount,
  setCurrentLevelIndex,
  callServer,
}: {
  nodes: Node<NodeData>[];
  setNodes: SetNodes;
  setEdges: SetEdges;
  addLog: (msg: string) => void;
  setIsRunning: (isRunning: boolean) => void;
  setLevels: (levels: string[][]) => void;
  setFailedNodeIds: (failedNodeIds: Set<string>) => void;
  setFailedCount: (failedCount: number) => void;
  setCurrentLevelIndex: (levelIndex: number) => void;
  callServer: (nodeId: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const { isRunning } = useRunContext();
  const { failedNodeIds, currentLevelIndex } = useRunMetaContext();
  const levelsRef = React.useRef<string[][]>([]);
  const isCancelledRef = React.useRef(false);

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

  const processLevel = React.useCallback(
    async (levelIndex: number) => {
      if (isCancelledRef.current) return false;
      const level = levelsRef.current[levelIndex] ?? [];
      const levelNodeList = nodes.filter((node) => level.includes(node.id));
      const processingNodes = levelNodeList.filter(
        (node) => node.type === "custom",
      );
      const instantNodes = levelNodeList.filter(
        (node) => node.type !== "custom",
      );

      if (instantNodes.length) {
        const instantIds = new Set(instantNodes.map((node) => node.id));
        setNodes((nodes) => markSuccess(nodes, instantIds));
      }

      if (processingNodes.length && !isCancelledRef.current) {
        const ids = new Set(processingNodes.map((node) => node.id));
        setNodes((nodes) => markRunning(nodes, ids));
        const results = await Promise.allSettled(
          processingNodes.map(async (node) => {
            addLog(`[run] 노드 ${node.id} 실행`);
            const r = await callServer(node.id);
            return { id: node.id, ok: r.ok };
          }),
        );
        const successIds = new Set<string>();
        const failedIds = new Set<string>();
        for (const result of results) {
          if (result.status === "fulfilled") {
            if (result.value.ok) {
              successIds.add(result.value.id);
              addLog(`[run] 노드 ${result.value.id} 완료`);
            } else {
              failedIds.add(result.value.id);
              addLog(`[run] 노드 ${result.value.id} 실패`);
            }
          } else {
            addLog("[run] 노드 실행 중 예외 발생");
          }
        }
        if (successIds.size)
          setNodes((nodes) => markSuccess(nodes, successIds));
        if (failedIds.size) setNodes((nodes) => markFailed(nodes, failedIds));
        if (failedIds.size > 0) {
          setFailedNodeIds(failedIds);
          setFailedCount(failedIds.size);
          addLog(
            `[run] 레벨 ${levelIndex + 1} 실패: ${failedIds.size}개 노드, 수동 재시도 필요`,
          );
          return false;
        }
      }
      return true;
    },
    [nodes, setNodes, addLog, callServer, setFailedNodeIds, setFailedCount],
  );

  const continueFrom = React.useCallback(
    async (startLevelIndex: number) => {
      for (
        let levelIndex = startLevelIndex;
        levelIndex < levelsRef.current.length;
        levelIndex++
      ) {
        if (isCancelledRef.current) break;
        setCurrentLevelIndex(levelIndex);
        addLog(`[run] 레벨 ${levelIndex + 1} 시작`);
        const isLevelSuccess = await processLevel(levelIndex);
        if (!isLevelSuccess) {
          setIsRunning(false);
          addLog("[run] 일시 중지: 재시도를 기다리는 중");
          return;
        }
      }
      setEdgesDashed(false);
      setIsRunning(false);
      addLog("[run] 실행 완료");
    },
    [processLevel, setCurrentLevelIndex, addLog, setIsRunning, setEdgesDashed],
  );

  const runFlow = React.useCallback(
    async (nodesArg: Node<NodeData>[], edgesArg: Edge[]) => {
      setIsRunning(true);
      setEdgesDashed(true);
      levelsRef.current = computeLevelsGraph(nodesArg, edgesArg);
      setLevels(levelsRef.current);
      setFailedNodeIds(new Set());
      setFailedCount(0);
      setNodes((nodes) => markAllNodesStatus(nodes, "idle"));
      await continueFrom(0);
    },
    [
      setIsRunning,
      setEdgesDashed,
      setLevels,
      setFailedNodeIds,
      setFailedCount,
      setNodes,
      continueFrom,
    ],
  );

  const cancelAll = React.useCallback(() => {
    isCancelledRef.current = true;
    setEdgesDashed(false);
    setIsRunning(false);
  }, [setEdgesDashed, setIsRunning]);

  const retryNode = React.useCallback(
    async (nodeId: string) => {
      if (!failedNodeIds.has(nodeId)) return;
      if (isRunning) return;
      setIsRunning(true);
      addLog(`[run] 노드 ${nodeId} 개별 재시도 시작`);
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, runStatus: "running" } }
            : node,
        ),
      );
      const r = await callServer(nodeId);
      const ok = r.ok;
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id !== nodeId) return node;
          return {
            ...node,
            data: { ...node.data, runStatus: ok ? "success" : "failed" },
          };
        }),
      );
      if (ok) {
        const next = new Set(failedNodeIds);
        next.delete(nodeId);
        setFailedNodeIds(next);
        setFailedCount(next.size);
        addLog(`[run] 노드 ${nodeId} 개별 재시도 성공`);
        if (next.size === 0) {
          addLog(
            `[run] 레벨 ${currentLevelIndex + 1} 재시도 완료, 다음 레벨 진행`,
          );
          await continueFrom(currentLevelIndex + 1);
        } else {
          setIsRunning(false);
        }
      } else {
        addLog(`[run] 노드 ${nodeId} 개별 재시도 실패`);
        setIsRunning(false);
      }
    },
    [
      failedNodeIds,
      isRunning,
      setIsRunning,
      addLog,
      setNodes,
      callServer,
      setFailedNodeIds,
      setFailedCount,
      currentLevelIndex,
      continueFrom,
    ],
  );

  return { runFlow, continueFrom, processLevel, cancelAll, retryNode };
}
