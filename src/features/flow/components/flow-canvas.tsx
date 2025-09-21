"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { useDelayApi } from "@/features/flow/hooks/use-delay-api";
import { useFlowExecution } from "@/features/flow/hooks/use-flow-execution";
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
  const addLog = useFlowGeneratorStore.use.run((runState) => runState.addLog);
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
  const setRetryNode = useFlowGeneratorStore.use.nodeActions(
    (nodeActions) => nodeActions.setRetryNode,
  );

  const {
    runFlow: runFlowExec,
    cancelAll: sseCancelAll,
    events,
    error,
    sessionId,
    clearEvents,
  } = useFlowExecution({
    nodes,
    setNodes,
    setEdges,
    addLog,
    setIsRunning,
    setLevels,
    setFailedNodeIds,
    setFailedCount,
    setCurrentLevelIndex,
  });

  // 마지막 사용된 프롬프트 저장
  const [lastPrompt, setLastPrompt] = useState<string>("");

  // 엣지 연결 유효성 검사
  const isValidConnection = useCallback<IsValidConnection<Edge>>(
    (connectionItem) => {
      const source = connectionItem.source;
      const target = connectionItem.target;

      if (!source || !target) return false;

      const sourceHandle = connectionItem.sourceHandle ?? null;
      const targetHandle = connectionItem.targetHandle ?? null;

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
      edgeReconnectSuccessful.current = true;
      setEdges((edges) => reconnectEdge(oldEdge, newConnection, edges));
    },
    [setEdges],
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
    addLog("[run] 실행 중단 요청");
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
  }, [isRunning, addLog, delayCancelAll, sseCancelAll, setNodes]);

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
      clearEvents(); // 이전 이벤트 클리어
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
    clearEvents,
  ]);

  // 이벤트를 기존 로그 형태로 변환 (기존 시스템과의 호환성을 위해)
  useEffect(() => {
    events.forEach((event) => {
      const timestamp = new Date(event.timestamp).toLocaleTimeString();

      switch (event.type) {
        case "node_start": {
          const nodeName = event.nodeName ?? "알 수 없는 노드";
          addLog(`[${timestamp}] 🔄 ${nodeName} 시작`);
          break;
        }
        case "node_complete": {
          const nodeName = event.nodeName ?? "알 수 없는 노드";
          addLog(`[${timestamp}] ✅ ${nodeName} 완료`);
          break;
        }
        case "node_error": {
          const nodeName = event.nodeName ?? "알 수 없는 노드";
          const errorMsg = event.error ?? "알 수 없는 오류";
          addLog(`[${timestamp}] ❌ ${nodeName} 오류: ${errorMsg}`);
          break;
        }
        case "flow_complete": {
          const sessionDisplay = sessionId ?? "알 수 없음";
          addLog(`[${timestamp}] 🎉 플로우 완료! (세션: ${sessionDisplay})`);
          break;
        }
        case "flow_error": {
          const errorMsg = event.error ?? "알 수 없는 오류";
          addLog(`[${timestamp}] 💥 플로우 오류: ${errorMsg}`);
          break;
        }
        default: {
          // exhaustive 체크를 위한 타입 가드
          const _exhaustiveCheck: never = event;
          console.warn("처리되지 않은 이벤트 타입:", _exhaustiveCheck);
        }
      }
    });
  }, [events, addLog, sessionId]);

  // 각 노드에서 사용할 수 있도록 재시도 함수 등록
  useEffect(() => {
    const retryFlowFromNode = () => {
      retryFlow(); // 전체 플로우 재시작
    };

    setRetryNode(retryFlowFromNode);
    return () => setRetryNode(undefined);
  }, [retryFlow, setRetryNode]);

  // 에러 처리
  useEffect(() => {
    if (error) {
      addLog(`[오류] ${error}`);
    }
  }, [error, addLog]);

  return (
    <div className="flex h-screen">
      <Sidebar>
        <SidebarNodePalette />
      </Sidebar>
      <div className="flex-1" ref={reactFlowWrapper}>
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
          <Panel position="top-right">
            <RunControls
              canStart={runEligibility.ok}
              isRunning={isRunning}
              failedCount={
                error ||
                events.some(
                  (event) =>
                    event.type === "flow_error" || event.type === "node_error",
                )
                  ? 1
                  : 0
              }
              tooltip={runEligibility.ok ? null : runEligibility.reason}
              onStart={runFlow}
              onCancel={cancelRun}
              onRetry={retryFlow}
            />
          </Panel>
          <Panel position="bottom-right">
            <RunLogs events={events} onClear={clearEvents} />
          </Panel>
          <Controls />
          <MiniMap />
          <Background />
        </ReactFlow>
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
