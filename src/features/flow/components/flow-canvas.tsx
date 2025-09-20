"use client";

import { useCallback, useRef } from "react";
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
import { useRunEligibility } from "@/features/flow/hooks/use-run-eligibility";
import { useRunPipeline } from "@/features/flow/hooks/use-run-pipeline";
import type { NodeData } from "@/features/flow/types/nodes";
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
    setLevels,
    setCurrentLevelIndex,
    setFailedNodeIds,
    failedCount,
    setFailedCount,
  } = useRunMetaContext();

  const {
    runFlow: pipelineRunFlow,
    cancelAll: pipelineCancelAll,
    retryNode,
    retryLevel: pipelineRetryLevel,
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

  // 실행 가능 조건 검사 - 공용 훅 사용으로 중복 제거
  const runEligibility = useRunEligibility(nodes, edges);

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

  // 노드 실행은 훅 내부에서 처리 (callServer)

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
                onRetry={pipelineRetryLevel}
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
