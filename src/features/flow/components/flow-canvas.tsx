"use client";

import { useCallback, useMemo, useRef } from "react";
import {
  Background,
  type Connection,
  Controls,
  type Edge,
  type IsValidConnection,
  MiniMap,
  type Node,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  reconnectEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { edgeTypes } from "@/features/flow/components/nodes/custom-edge";
import { nodeTypes } from "@/features/flow/components/nodes/node-type-map";
import { RunControls } from "@/features/flow/components/run-controls";
import { RunLogs } from "@/features/flow/components/run-logs";
import { Sidebar } from "@/features/flow/components/sidebar";
import { SidebarNodePalette } from "@/features/flow/components/sidebar-node-palette";
import { DnDProvider, useDnD } from "@/features/flow/context/dnd-context";
import { NodeActionsProvider } from "@/features/flow/context/node-actions-context";
import {
  RunProvider,
  useRunContext,
} from "@/features/flow/context/run-context";
import {
  RunMetaProvider,
  useRunMetaContext,
} from "@/features/flow/context/run-meta-context";
import { useDelayApi } from "@/features/flow/hooks/use-delay-api";
import { useRunPipeline } from "@/features/flow/hooks/use-run-pipeline";
import type { NodeData } from "@/features/flow/types/nodes";
import {
  buildAdjacency,
  forwardReachable,
  hasCycle,
  reverseReachable,
} from "@/features/flow/utils/graph";
import { createNodeData, getId } from "@/features/flow/utils/node-factory";
import { buildSnapshot } from "@/features/flow/utils/snapshot";

const initialNodes: Node<NodeData>[] = [
  {
    id: "1",
    type: "inputNode",
    data: createNodeData("inputNode"),
    position: { x: 250, y: 25 },
  },
];

const DnDFlow = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const edgeReconnectSuccessful = useRef(true);
  const [nodes, setNodes, onNodesChange] =
    useNodesState<Node<NodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();
  const {
    isRunning,
    setRunning: setIsRunning,
    logs,
    addLog,
    clearLogs,
  } = useRunContext();
  const { callServer, cancelAll: delayCancelAll } = useDelayApi();
  const {
    // levels,
    setLevels,
    currentLevelIndex,
    setCurrentLevelIndex,
    failedNodeIds,
    setFailedNodeIds,
    failedCount,
    setFailedCount,
  } = useRunMetaContext();
  // 레벨/실패노드는 컨텍스트 값을 직접 사용

  const {
    runFlow: pipelineRunFlow,
    continueFrom: pipelineContinueFrom,
    cancelAll: pipelineCancelAll,
    retryNode,
  } = useRunPipeline({
    nodes: nodes,
    setNodes,
    setEdges: setEdges,
    addLog,
    setIsRunning,
    setLevels,
    setFailedNodeIds,
    setFailedCount,
    setCurrentLevelIndex,
    callServer,
  });

  // 엣지 연결 유효성 검사
  const isValidConnection = useCallback<IsValidConnection<Edge>>(
    (item) => {
      const source = item.source;
      const target = item.target;

      if (!source || !target) return false;

      const sourceHandle = item.sourceHandle ?? null;
      const targetHandle = item.targetHandle ?? null;

      if (source === target && sourceHandle === targetHandle && sourceHandle)
        return false;

      const sourceNode = nodes.find((node) => node.id === source);
      const targetNode = nodes.find((node) => node.id === target);

      if (!sourceNode || !targetNode) return false;

      if (sourceNode.type === "inputNode" && targetNode.type === "inputNode")
        return false;

      if (sourceNode.type === "outputNode") return false;

      return true;
    },
    [nodes],
  );

  // 엣지 추가
  const onConnect = useCallback(
    (params: Connection) => {
      if (isValidConnection(params)) {
        setEdges((eds) => addEdge(params, eds));
      }
    },
    [setEdges, isValidConnection],
  );

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  // 기존 엣지를 새로운 연결로 갱신.
  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeReconnectSuccessful.current = true;
      setEdges((edges) => reconnectEdge(oldEdge, newConnection, edges));
    },
    [setEdges],
  );

  const onReconnectEnd = useCallback(
    (_: MouseEvent | TouchEvent, edge: Edge) => {
      if (!edgeReconnectSuccessful.current) {
        setEdges((edges) =>
          edges.filter((candidate) => candidate.id !== edge.id),
        );
      }
      edgeReconnectSuccessful.current = true;
    },
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // 팔레트에서 노드 드롭
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<NodeData> = {
        id: getId(),
        type,
        position,
        data: createNodeData(type),
      };

      setNodes((nodes) => nodes.concat(newNode));
    },
    [screenToFlowPosition, type, setNodes],
  );

  // Delete/Backspace로 노드/엣지 삭제
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        const selectedNodes = nodes.filter((node) => node.selected);
        const selectedEdges = edges.filter((edge) => edge.selected);

        if (selectedNodes.length > 0) {
          setNodes((nodes) => nodes.filter((node) => !node.selected));
        }

        if (selectedEdges.length > 0) {
          setEdges((eds) => eds.filter((edge) => !edge.selected));
        }
      }
    },
    [nodes, edges, setEdges, setNodes],
  );

  // 실행 가능 조건 검사
  const runEligibility = useMemo(() => {
    if (nodes.length === 0) {
      return { ok: false, reason: "노드가 없습니다." } as const;
    }

    const inputNodes = nodes.filter((node) => node.type === "inputNode");
    const outputNodes = nodes.filter((node) => node.type === "outputNode");

    if (inputNodes.length !== 1)
      return {
        ok: false,
        reason: "시작 노드는 정확히 1개여야 합니다.",
      } as const;
    if (outputNodes.length !== 1)
      return {
        ok: false,
        reason: "종료 노드는 정확히 1개여야 합니다.",
      } as const;

    const adj = buildAdjacency(nodes, edges);
    if (hasCycle(adj))
      return { ok: false, reason: "사이클이 존재합니다." } as const;

    // 입력에서 도달 가능한 노드
    const startId = inputNodes[0]!.id;
    const reachable = forwardReachable(startId, adj);
    // 출력으로 도달 가능한 역방향 검사
    const endId = outputNodes[0]!.id;
    const revReach = reverseReachable(endId, adj);
    for (const node of nodes) {
      // 시작/종료 및 경로 위에 있지 않은 고립 노드가 있으면 실행 비활성화
      const onMainPath = reachable.has(node.id) && revReach.has(node.id);
      if (!onMainPath) {
        return {
          ok: false,
          reason: "모든 노드가 시작→종료 경로 위에 있어야 합니다.",
        } as const;
      }
    }

    if (edges.length === 0)
      return { ok: false, reason: "연결(엣지)이 필요합니다." } as const;

    return { ok: true, reason: null } as const;
  }, [nodes, edges]);

  // 현재 플로우 스냅샷을 서버로 전달
  const sendSnapshot = useCallback(async () => {
    try {
      const payload = buildSnapshot(nodes, edges);
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        addLog(`[send] 스냅샷 전송 실패: ${res.status}`);
        return false;
      }
      addLog("[send] 스냅샷 전송 성공");
      return true;
    } catch {
      addLog("[send] 스냅샷 전송 중 오류");
      return false;
    }
  }, [nodes, edges, addLog]);

  // 노드 실행(딜레이 API 호출)
  const callServerApiForNode = useCallback(
    async (nodeId: string) => {
      const r = await callServer(nodeId);
      if (!r.ok) addLog(`[delay] 노드 ${nodeId} 실패: ${r.error}`);
      else addLog(`[delay] 노드 ${nodeId} 성공`);
      return r.ok;
    },
    [callServer, addLog],
  );

  // 실행 중단
  const cancelRun = useCallback(() => {
    if (!isRunning) return;
    addLog("[run] 실행 중단 요청");
    delayCancelAll();
    pipelineCancelAll();
    // 실행 중이던 노드를 실패로 표시
    setNodes((nodes) =>
      nodes.map((node) =>
        node.data.runStatus === "running"
          ? { ...node, data: { ...node.data, runStatus: "failed" } }
          : node,
      ),
    );
  }, [isRunning, addLog, delayCancelAll, pipelineCancelAll, setNodes]);

  // 전체 실행 시작
  const runFlow = useCallback(async () => {
    if (!runEligibility.ok || isRunning) return;
    addLog("[run] 실행 시작");
    await sendSnapshot();
    await pipelineRunFlow(nodes, edges);
  }, [
    runEligibility.ok,
    isRunning,
    addLog,
    sendSnapshot,
    pipelineRunFlow,
    nodes,
    edges,
  ]);

  // 레벨 단위 재시도
  const handleRetryLevel = useCallback(async () => {
    if (isRunning || failedNodeIds.size === 0) return;
    const failedIds = new Set(failedNodeIds);
    setIsRunning(true);
    addLog(
      `[run] 레벨 ${currentLevelIndex + 1} 재시도 시작 (${failedIds.size}개)`,
    );
    setNodes((nodes) =>
      nodes.map((node) =>
        failedIds.has(node.id)
          ? { ...node, data: { ...node.data, runStatus: "running" } }
          : node,
      ),
    );
    const retryNodes = nodes.filter((node) => failedIds.has(node.id));
    const results = await Promise.allSettled(
      retryNodes.map(async (node) => {
        const ok = await callServerApiForNode(node.id);
        return { id: node.id, ok };
      }),
    );
    const successSet = new Set<string>();
    const failedSet = new Set<string>();
    for (const r of results) {
      if (r.status === "fulfilled") {
        if (r.value.ok) successSet.add(r.value.id);
        else failedSet.add(r.value.id);
      } else {
        addLog("[run] 재시도 중 예외 발생");
      }
    }
    setNodes((nodes) =>
      nodes.map((node) => {
        if (successSet.has(node.id)) {
          return { ...node, data: { ...node.data, runStatus: "success" } };
        }
        if (failedSet.has(node.id)) {
          return { ...node, data: { ...node.data, runStatus: "failed" } };
        }
        return node;
      }),
    );
    if (failedSet.size > 0) {
      setFailedNodeIds(failedSet);
      setFailedCount(failedSet.size);
      addLog(
        `[run] 재시도 실패: ${failedSet.size}개 노드, 다시 재시도하거나 중단하세요`,
      );
      setIsRunning(false);
      return;
    }
    setFailedNodeIds(new Set());
    setFailedCount(0);
    addLog(`[run] 레벨 ${currentLevelIndex + 1} 재시도 성공`);
    await pipelineContinueFrom(currentLevelIndex + 1);
  }, [
    isRunning,
    setIsRunning,
    addLog,
    setNodes,
    nodes,
    callServerApiForNode,
    setFailedNodeIds,
    setFailedCount,
    pipelineContinueFrom,
    currentLevelIndex,
    failedNodeIds,
  ]);

  return (
    <div className="flex h-screen">
      <Sidebar>
        <SidebarNodePalette />
      </Sidebar>
      <div className="flex-1" ref={reactFlowWrapper}>
        <NodeActionsProvider retryNode={retryNode}>
          <ReactFlow<Node<NodeData>, Edge>
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onReconnect={onReconnect}
            onReconnectStart={onReconnectStart}
            onReconnectEnd={onReconnectEnd}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            onKeyDown={onKeyDown}
            tabIndex={0}
            className="bg-gradient-to-br from-slate-50 to-violet-50"
            defaultEdgeOptions={{
              type: "custom",
              deletable: true,
            }}
          >
            <Panel position="top-right">
              <RunControls
                canStart={runEligibility.ok}
                isRunning={isRunning}
                failedCount={failedCount}
                tooltip={runEligibility.ok ? null : runEligibility.reason}
                onStart={runFlow}
                onCancel={cancelRun}
                onRetry={handleRetryLevel}
              />
            </Panel>
            <Panel position="bottom-right">
              <RunLogs logs={logs} onClear={clearLogs} />
            </Panel>
            <Controls />
            <MiniMap />
            <Background />
          </ReactFlow>
        </NodeActionsProvider>
      </div>
    </div>
  );
};

export const FlowBuilder = () => (
  <div className="h-screen">
    <ReactFlowProvider>
      <RunProvider>
        <RunMetaProvider>
          <DnDProvider>
            <DnDFlow />
          </DnDProvider>
        </RunMetaProvider>
      </RunProvider>
    </ReactFlowProvider>
  </div>
);
