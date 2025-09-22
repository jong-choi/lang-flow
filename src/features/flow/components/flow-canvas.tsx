"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  Background,
  type Connection,
  Controls,
  type Edge,
  MiniMap,
  type Node,
  ReactFlow,
  addEdge,
  reconnectEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { edgeTypes } from "@/features/flow/components/nodes/custom-edge";
import { nodeTypes } from "@/features/flow/components/nodes/node-type-map";
import { ResultsTab } from "@/features/flow/components/results-tab";
import { useDelayApi } from "@/features/flow/hooks/use-delay-api";
import { useFlowExecution } from "@/features/flow/hooks/use-flow-execution";
import { useIsValidConnection } from "@/features/flow/hooks/use-is-valid-connection";
import { useRunEligibility } from "@/features/flow/hooks/use-run-eligibility";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";
import type { NodeData } from "@/features/flow/types/nodes";
import { createNodeData, getId } from "@/features/flow/utils/node-factory";

const initialNodes: Node<NodeData>[] = [
  {
    id: "1",
    type: "inputNode",
    data: createNodeData("inputNode"),
    position: { x: 250, y: 25 },
  },
];

type FlowCanvasProps = {
  activeTab: "graph" | "results";
  onRunComplete?: () => void;
};

export const FlowCanvas = ({ activeTab, onRunComplete }: FlowCanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const edgeReconnectSuccessful = useRef(true);
  const [nodes, setNodes, onNodesChange] =
    useNodesState<Node<NodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { screenToFlowPosition } = useReactFlow();
  const type = useFlowGeneratorStore.use.draggingType();
  const setDraggingType = useFlowGeneratorStore.use.setDraggingType();
  const isRunning = useFlowGeneratorStore.use.isRunning();
  const setIsRunning = useFlowGeneratorStore.use.setRunning();
  const { cancelAll: delayCancelAll } = useDelayApi();
  const setLevels = useFlowGeneratorStore.use.setLevels();
  const setCurrentLevelIndex = useFlowGeneratorStore.use.setCurrentLevelIndex();
  const setFailedNodeIds = useFlowGeneratorStore.use.setFailedNodeIds();
  const setFailedCount = useFlowGeneratorStore.use.setFailedCount();
  const failedNodeIds = useFlowGeneratorStore.use.failedNodeIds(
    useShallow((ids) => ids),
  );
  const setRunGate = useFlowGeneratorStore.use.setRunGate();
  // 이벤트 기반 요청 상태/액션
  const runRequest = useFlowGeneratorStore.use.runRequest();
  const cancelRequestId = useFlowGeneratorStore.use.cancelRequestId();
  const retryRequestId = useFlowGeneratorStore.use.retryRequestId();
  const nodeRetryRequest = useFlowGeneratorStore.use.nodeRetryRequest();
  const consumeRunRequest = useFlowGeneratorStore.use.consumeRunRequest();
  const consumeCancelRequest = useFlowGeneratorStore.use.consumeCancelRequest();
  const consumeRetryRequest = useFlowGeneratorStore.use.consumeRetryRequest();
  const consumeNodeRetryRequest =
    useFlowGeneratorStore.use.consumeNodeRetryRequest();

  const {
    runFlow: runFlowExec,
    cancelAll: sseCancelAll,
    error,
    sessionId,
    results,
  } = useFlowExecution({
    setNodes,
    setEdges,
    setIsRunning,
    setLevels,
    setFailedNodeIds,
    setFailedCount,
    setCurrentLevelIndex,
    onComplete: () => onRunComplete?.(),
  });

  // 마지막 사용된 프롬프트 저장 및 프롬프트 모달
  const [lastPrompt, setLastPrompt] = useState<string>("");

  // 엣지 연결 유효성 검사
  const isValidConnection = useIsValidConnection(nodes);

  // 엣지 추가
  const onConnect = useCallback(
    (connectionParams: Connection) => {
      if (isValidConnection(connectionParams)) {
        setEdges((existingEdges) => addEdge(connectionParams, existingEdges));
      }
    },
    [setEdges, isValidConnection],
  );

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  // 기존 엣지를 새로운 연결로 갱신
  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      // 재연결 시에도 동일한 유효성 검사를 적용해 우회 방지
      if (!isValidConnection(newConnection)) {
        edgeReconnectSuccessful.current = false;
        return;
      }
      edgeReconnectSuccessful.current = true;
      setEdges((edges) => reconnectEdge(oldEdge, newConnection, edges));
    },
    [setEdges, isValidConnection],
  );

  const onReconnectEnd = useCallback(
    (reconnectEvent: MouseEvent | TouchEvent, edge: Edge) => {
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
    (dropEvent: React.DragEvent) => {
      dropEvent.preventDefault();

      if (!type) {
        return;
      }

      const position = screenToFlowPosition({
        x: dropEvent.clientX,
        y: dropEvent.clientY,
      });

      const newNode: Node<NodeData> = {
        id: getId(),
        type,
        position,
        data: createNodeData(type),
      };

      setNodes((existingNodes) => existingNodes.concat(newNode));
      // 드랍 후 초기화
      setDraggingType(undefined);
    },
    [screenToFlowPosition, type, setNodes, setDraggingType],
  );

  // 실행 가능 조건 검사
  const runEligibility = useRunEligibility(nodes, edges);

  // 실행 중단
  const cancelRun = useCallback(() => {
    if (!isRunning) return;
    delayCancelAll();
    sseCancelAll();
    // 실행 중이던 노드를 실패로 표시
    setNodes((nodes) =>
      nodes.map((node) =>
        node.data.runStatus === "running"
          ? { ...node, data: { ...node.data, runStatus: "failed" } }
          : node,
      ),
    );
  }, [isRunning, delayCancelAll, sseCancelAll, setNodes]);

  // 전체 실행 시작
  const runFlow = useCallback(
    async (prompt: string) => {
      if (!runEligibility.ok || isRunning) return;

      try {
        setIsRunning(true);
        setLastPrompt(prompt); // (1) 프롬프트 저장
        await runFlowExec(prompt, nodes, edges);
      } catch (error) {
        console.error("플로우 실행 오류:", error);
      } finally {
        setIsRunning(false);
      }
    },
    [runEligibility.ok, isRunning, runFlowExec, nodes, edges, setIsRunning],
  );

  // 플로우 재시작 (2) 저장된 프롬프트 재사용
  const retryFlow = useCallback(async () => {
    if (!lastPrompt || !runEligibility.ok || isRunning) return;

    try {
      setIsRunning(true);
      await runFlowExec(lastPrompt, nodes, edges);
    } catch (error) {
      console.error("플로우 재시도 오류:", error);
    } finally {
      setIsRunning(false);
    }
  }, [
    lastPrompt,
    runEligibility.ok,
    isRunning,
    runFlowExec,
    nodes,
    edges,
    setIsRunning,
  ]);

  useEffect(() => {
    if (!nodeRetryRequest) return;
    retryFlow();
    consumeNodeRetryRequest();
  }, [consumeNodeRetryRequest, nodeRetryRequest, retryFlow]);

  useEffect(() => {
    if (!retryRequestId) return;
    retryFlow();
    consumeRetryRequest();
  }, [consumeRetryRequest, retryFlow, retryRequestId]);

  useEffect(() => {
    if (!runRequest) return;
    runFlow(runRequest.prompt);
    consumeRunRequest();
  }, [consumeRunRequest, runFlow, runRequest]);

  useEffect(() => {
    if (!cancelRequestId) return;
    cancelRun();
    consumeCancelRequest();
  }, [cancelRequestId, cancelRun, consumeCancelRequest]);

  useEffect(() => {
    setRunGate({
      canRun: runEligibility.ok && !isRunning,
      runDisabledReason: runEligibility.ok
        ? null
        : (runEligibility.reason ?? null),
      canRetry: !!error || failedNodeIds.size > 0,
    });
  }, [
    isRunning,
    runEligibility.ok,
    runEligibility.reason,
    error,
    failedNodeIds,
    setRunGate,
  ]);

  return (
    <div className="min-h-0 flex-1 relative" ref={reactFlowWrapper}>
      {activeTab === "graph" ? (
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
          tabIndex={0}
          className="bg-gradient-to-br from-slate-50 to-violet-50"
          defaultEdgeOptions={{
            type: "custom",
            deletable: true,
          }}
        >
          <Controls />
          <MiniMap />
          <Background />
        </ReactFlow>
      ) : (
        <ResultsTab results={results} sessionId={sessionId} />
      )}
    </div>
  );
};
