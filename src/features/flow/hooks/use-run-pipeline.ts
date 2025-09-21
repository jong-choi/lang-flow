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

type SetNodes = React.Dispatch<React.SetStateAction<Node<NodeData>[]>>;
type SetEdges = React.Dispatch<React.SetStateAction<Edge[]>>;

export function useRunPipeline({
  nodes,
  setNodes,
  setEdges,
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
  setIsRunning: (isRunning: boolean) => void;
  setLevels: (levels: string[][]) => void;
  setFailedNodeIds: (failedNodeIds: Set<string>) => void;
  setFailedCount: (failedCount: number) => void;
  setCurrentLevelIndex: (levelIndex: number) => void;
  callServer: (nodeId: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const isRunning = useFlowGeneratorStore.use.run((s) => s.isRunning);
  const failedNodeIds = useFlowGeneratorStore.use.runMeta(
    (m) => m.failedNodeIds,
  );
  const currentLevelIndex = useFlowGeneratorStore.use.runMeta(
    (m) => m.currentLevelIndex,
  );
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
      const processingNodes: Node<NodeData>[] = [];
      const instantNodes = levelNodeList;

      if (instantNodes.length) {
        const instantIds = new Set(instantNodes.map((node) => node.id));
        setNodes((nodes) => markSuccess(nodes, instantIds));
      }

      if (processingNodes.length && !isCancelledRef.current) {
        const ids = new Set(processingNodes.map((node) => node.id));
        setNodes((nodes) => markRunning(nodes, ids));
        const results = await Promise.allSettled(
          processingNodes.map(async (node) => {
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
            } else {
              failedIds.add(result.value.id);
            }
          }
        }
        if (successIds.size)
          setNodes((nodes) => markSuccess(nodes, successIds));
        if (failedIds.size) setNodes((nodes) => markFailed(nodes, failedIds));
        if (failedIds.size > 0) {
          setFailedNodeIds(failedIds);
          setFailedCount(failedIds.size);
          return false;
        }
      }
      return true;
    },
    [nodes, setNodes, callServer, setFailedNodeIds, setFailedCount],
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
        const isLevelSuccess = await processLevel(levelIndex);
        if (!isLevelSuccess) {
          setIsRunning(false);
          return;
        }
      }
      setEdgesDashed(false);
      setIsRunning(false);
    },
    [processLevel, setCurrentLevelIndex, setIsRunning, setEdgesDashed],
  );

  const runFlow = React.useCallback(
    async (nodesArg: Node<NodeData>[], edgesArg: Edge[]) => {
      isCancelledRef.current = false;
      setIsRunning(true);
      setEdgesDashed(true);
      levelsRef.current = computeLevelsGraph(nodesArg, edgesArg);
      setLevels(levelsRef.current);
      setFailedNodeIds(new Set());
      setFailedCount(0);
      setNodes((nodes) => markAllNodesStatus(nodes, RUN_STATUS.IDLE));
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
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, runStatus: RUN_STATUS.RUNNING } }
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
            data: {
              ...node.data,
              runStatus: ok ? RUN_STATUS.SUCCESS : RUN_STATUS.FAILED,
            },
          };
        }),
      );
      if (ok) {
        const next = new Set(failedNodeIds);
        next.delete(nodeId);
        setFailedNodeIds(next);
        setFailedCount(next.size);
        if (next.size === 0) {
          await continueFrom(currentLevelIndex + 1);
        } else {
          setIsRunning(false);
        }
      } else {
        setIsRunning(false);
      }
    },
    [
      failedNodeIds,
      isRunning,
      setIsRunning,
      setNodes,
      callServer,
      setFailedNodeIds,
      setFailedCount,
      currentLevelIndex,
      continueFrom,
    ],
  );

  const retryLevel = React.useCallback(async () => {
    if (isRunning || failedNodeIds.size === 0) return;
    const failedIds = new Set(failedNodeIds);
    setIsRunning(true);
    setNodes((nodes) => markRunning(nodes, failedIds));
    const retryNodes = nodes.filter((node) => failedIds.has(node.id));
    const results = await Promise.allSettled(
      retryNodes.map(async (node) => {
        const nodeResult = await callServer(node.id);
        return { id: node.id, ok: nodeResult.ok } as const;
      }),
    );
    const successSet = new Set<string>();
    const failedSet = new Set<string>();
    for (const result of results) {
      if (result.status === "fulfilled") {
        if (result.value.ok) successSet.add(result.value.id);
        else failedSet.add(result.value.id);
      }
    }
    if (successSet.size) setNodes((nodes) => markSuccess(nodes, successSet));
    if (failedSet.size) setNodes((nodes) => markFailed(nodes, failedSet));

    if (failedSet.size > 0) {
      setFailedNodeIds(failedSet);
      setFailedCount(failedSet.size);
      setIsRunning(false);
      return;
    }
    setFailedNodeIds(new Set());
    setFailedCount(0);
    await continueFrom(currentLevelIndex + 1);
  }, [
    isRunning,
    failedNodeIds,
    setIsRunning,
    setNodes,
    nodes,
    callServer,
    setFailedNodeIds,
    setFailedCount,
    continueFrom,
    currentLevelIndex,
  ]);

  return {
    runFlow,
    continueFrom,
    processLevel,
    cancelAll,
    retryNode,
    retryLevel,
  };
}
