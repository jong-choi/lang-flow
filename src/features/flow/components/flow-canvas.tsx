"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GitBranch, MessageSquare, Play, RotateCw, Square } from "lucide-react";
import {
  Background,
  type Connection,
  Controls,
  type Edge,
  MiniMap,
  type Node,
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
import { PromptInputModal } from "@/features/flow/components/prompt-input-modal";
import { ResultsTab } from "@/features/flow/components/results-tab";
// RunLogs 패널 제거
import { Sidebar } from "@/features/flow/components/sidebar";
import { SidebarNodePalette } from "@/features/flow/components/sidebar-node-palette";
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

const DnDFlow = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const edgeReconnectSuccessful = useRef(true);
  const [nodes, setNodes, onNodesChange] =
    useNodesState<Node<NodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { screenToFlowPosition } = useReactFlow();
  const type = useFlowGeneratorStore.use.dnd(
    (dragState) => dragState.draggingType,
  );
  const setDraggingType = useFlowGeneratorStore.use.dnd(
    (dragState) => dragState.setDraggingType,
  );
  const isRunning = useFlowGeneratorStore.use.run(
    (runState) => runState.isRunning,
  );
  const setIsRunning = useFlowGeneratorStore.use.run(
    (runState) => runState.setRunning,
  );
  const { cancelAll: delayCancelAll } = useDelayApi();
  const setLevels = useFlowGeneratorStore.use.runMeta(
    (metaState) => metaState.setLevels,
  );
  const setCurrentLevelIndex = useFlowGeneratorStore.use.runMeta(
    (metaState) => metaState.setCurrentLevelIndex,
  );
  const setFailedNodeIds = useFlowGeneratorStore.use.runMeta(
    (metaState) => metaState.setFailedNodeIds,
  );
  const setFailedCount = useFlowGeneratorStore.use.runMeta(
    (metaState) => metaState.setFailedCount,
  );
  const failedNodeIds = useFlowGeneratorStore.use.runMeta(
    (metaState) => metaState.failedNodeIds,
  );
  const setRetryNode = useFlowGeneratorStore.use.nodeActions(
    (nodeActions) => nodeActions.setRetryNode,
  );

  const {
    runFlow: runFlowExec,
    cancelAll: sseCancelAll,
    error,
    sessionId,
    chatResults,
    flowCompleted,
  } = useFlowExecution({
    setNodes,
    setEdges,
    setIsRunning,
    setLevels,
    setFailedNodeIds,
    setFailedCount,
    setCurrentLevelIndex,
  });

  // 마지막 사용된 프롬프트 저장 및 프롬프트 모달
  const [lastPrompt, setLastPrompt] = useState<string>("");
  const [showPromptModal, setShowPromptModal] = useState(false);
  // 탭 상태: graph | results
  const [activeTab, setActiveTab] = useState<"graph" | "results">("graph");

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

  // 플로우 완료 시 결과물 탭으로 자동 전환
  useEffect(() => {
    if (flowCompleted && activeTab !== "results") {
      setActiveTab("results");
    }
  }, [flowCompleted, activeTab]);

  // 각 노드에서 사용할 수 있도록 재시도 함수 등록
  useEffect(() => {
    const retryFlowFromNode = () => {
      retryFlow(); // 전체 플로우 재시작
    };

    setRetryNode(retryFlowFromNode);
    return () => setRetryNode(undefined);
  }, [retryFlow, setRetryNode]);

  return (
    <div className="flex h-screen">
      <Sidebar>
        <SidebarNodePalette />
      </Sidebar>
      <div className="flex-1 flex flex-col" ref={reactFlowWrapper}>
        {/* 메인 헤더 + 탭 */}
        <div className="shrink-0 border-b bg-white/60 dark:bg-slate-900/60 backdrop-blur supports-[backdrop-filter]:bg-white/40 border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                className="inline-flex items-center gap-1 px-3 h-9 rounded-md bg-slate-900 text-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowPromptModal(true)}
                disabled={!runEligibility.ok || isRunning}
                title={
                  runEligibility.ok
                    ? undefined
                    : runEligibility.reason || undefined
                }
              >
                <Play className="size-4" /> 시작
              </button>
              <button
                className="inline-flex items-center gap-1 px-3 h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 disabled:opacity-50"
                onClick={cancelRun}
                disabled={!isRunning}
              >
                <Square className="size-4" /> 중단
              </button>
              <button
                className="inline-flex items-center gap-1 px-3 h-9 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-50"
                onClick={retryFlow}
                disabled={isRunning || !(error || failedNodeIds.size > 0)}
                title={
                  error || failedNodeIds.size > 0
                    ? undefined
                    : "재시도할 항목 없음"
                }
              >
                <RotateCw className="size-4" /> 재시도
              </button>
            </div>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />
            <nav className="flex items-center gap-1">
              <button
                className={`inline-flex items-center gap-1 px-3 h-8 rounded-md border ${
                  activeTab === "graph"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                }`}
                onClick={() => setActiveTab("graph")}
              >
                <GitBranch className="size-4" /> 그래프
              </button>
              <button
                className={`inline-flex items-center gap-1 px-3 h-8 rounded-md border ${
                  activeTab === "results"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                }`}
                onClick={() => setActiveTab("results")}
              >
                <MessageSquare className="size-4" /> 결과물
              </button>
            </nav>
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="min-h-0 flex-1 relative">
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
              {/* 로그 패널 제거됨 */}
              <Controls />
              <MiniMap />
              <Background />
            </ReactFlow>
          ) : (
            <ResultsTab chatResults={chatResults} sessionId={sessionId} />
          )}
        </div>
        {/* 프롬프트 입력 모달 */}
        <PromptInputModal
          open={showPromptModal}
          onOpenChange={setShowPromptModal}
          onSubmit={runFlow}
          isSubmitting={isRunning}
        />
      </div>
    </div>
  );
};

export const FlowBuilder = () => (
  <div className="h-screen">
    <ReactFlowProvider>
      <DnDFlow />
    </ReactFlowProvider>
  </div>
);
