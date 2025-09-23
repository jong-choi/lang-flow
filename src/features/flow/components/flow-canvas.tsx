"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import {
  Background,
  type Connection,
  Controls,
  MiniMap,
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
import { TemplateGroupsOverlay } from "@/features/flow/components/workflow/template-group-layover";
import { nodeTypeConfigs } from "@/features/flow/constants/node-config";
import { useDelayApi } from "@/features/flow/hooks/use-delay-api";
import { useFlowExecution } from "@/features/flow/hooks/use-flow-execution";
import { useIsValidConnection } from "@/features/flow/hooks/use-is-valid-connection";
import { useRunEligibility } from "@/features/flow/hooks/use-run-eligibility";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";
import type {
  SchemaEdge,
  SchemaNode,
  WorkflowTemplateDetail,
} from "@/features/flow/types/nodes";
import {
  type TemplateGroup,
  buildNewNode,
  calculateTemplateInsertion,
  createDefaultNodes,
  createRandomEdgeId,
  createRandomGroupId,
  duplicateEdges,
  duplicateNodes,
  markRunningNodesAsFailed,
  pruneEmptyTemplateGroups,
} from "@/features/flow/utils/canvas";
import { createNodeData, getId } from "@/features/flow/utils/node-factory";
import { createRunGateState } from "@/features/flow/utils/workflow";

type FlowCanvasProps = {
  activeTab: "graph" | "results";
  onRunComplete?: () => void;
  initialNodes?: SchemaNode[];
  initialEdges?: SchemaEdge[];
};

export const FlowCanvas = ({
  activeTab,
  onRunComplete,
  initialNodes: initialNodesProp,
  initialEdges: initialEdgesProp,
}: FlowCanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const edgeReconnectSuccessful = useRef(true);
  const [nodes, setNodes, onNodesChange] = useNodesState<SchemaNode>(
    initialNodesProp ?? createDefaultNodes(createNodeData),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<SchemaEdge>(
    initialEdgesProp ?? [],
  );
  const { screenToFlowPosition } = useReactFlow();
  const type = useFlowGeneratorStore.use.draggingType();
  const setDraggingType = useFlowGeneratorStore.use.setDraggingType();
  const draggingTemplateId = useFlowGeneratorStore.use.draggingTemplateId();
  const setDraggingTemplateId =
    useFlowGeneratorStore.use.setDraggingTemplateId();
  const ensureTemplateDetail = useFlowGeneratorStore.use.ensureTemplateDetail();
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
  const setCanvasState = useFlowGeneratorStore.use.setCanvasState();
  const [templateGroups, setTemplateGroups] = useState<TemplateGroup[]>([]);
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
  const openNodeDialog = useFlowGeneratorStore.use.openNodeDialog();

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

  const insertTemplate = useCallback(
    (
      template: WorkflowTemplateDetail,
      dropPosition: { x: number; y: number },
    ) => {
      const insertion = calculateTemplateInsertion(template, dropPosition, {
        generateNodeId: getId,
        generateEdgeId: createRandomEdgeId,
        generateGroupId: createRandomGroupId,
      });

      if (!insertion) {
        toast.error("추가할 노드를 찾지 못했습니다.");
        return;
      }

      const { nodesToAdd, edgesToAdd, group } = insertion;

      setNodes((prev) => prev.concat(nodesToAdd));
      setEdges((prev) => prev.concat(edgesToAdd));
      setTemplateGroups((prev) => prev.concat(group));
    },
    [setEdges, setNodes, setTemplateGroups],
  );

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  // 기존 엣지를 새로운 연결로 갱신
  const onReconnect = useCallback(
    (oldEdge: SchemaEdge, newConnection: Connection) => {
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
    (reconnectEvent: MouseEvent | TouchEvent, edge: SchemaEdge) => {
      if (!edgeReconnectSuccessful.current) {
        setEdges((edges) =>
          edges.filter((candidate) => candidate.id !== edge.id),
        );
      }
      edgeReconnectSuccessful.current = true;
    },
    [setEdges],
  );

  useEffect(() => {
    setCanvasState(nodes, edges);
  }, [edges, nodes, setCanvasState]);

  const hasHydratedNodesFromProps = useRef(false);
  const hasHydratedEdgesFromProps = useRef(false);

  useEffect(() => {
    if (initialNodesProp) {
      hasHydratedNodesFromProps.current = true;
      setNodes(duplicateNodes(initialNodesProp));
      return;
    }

    if (hasHydratedNodesFromProps.current) {
      hasHydratedNodesFromProps.current = false;
      setNodes(createDefaultNodes(createNodeData));
    }
  }, [initialNodesProp, setNodes]);

  useEffect(() => {
    if (initialEdgesProp) {
      hasHydratedEdgesFromProps.current = true;
      setEdges(duplicateEdges(initialEdgesProp));
      return;
    }

    if (hasHydratedEdgesFromProps.current) {
      hasHydratedEdgesFromProps.current = false;
      setEdges([]);
    }
  }, [initialEdgesProp, setEdges]);

  useEffect(() => {
    setTemplateGroups((groups) => pruneEmptyTemplateGroups(groups, nodes));
  }, [nodes]);

  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = draggingTemplateId ? "copy" : "move";
    },
    [draggingTemplateId],
  );

  // 팔레트에서 노드/템플릿 드롭
  const onDrop = useCallback(
    async (dropEvent: React.DragEvent) => {
      dropEvent.preventDefault();

      const position = screenToFlowPosition({
        x: dropEvent.clientX,
        y: dropEvent.clientY,
      });

      if (draggingTemplateId) {
        const templateDetail = await ensureTemplateDetail(draggingTemplateId);
        if (templateDetail) {
          insertTemplate(templateDetail, position);
        } else {
          toast.error("템플릿을 불러오지 못했습니다.");
        }
        setDraggingTemplateId(undefined);
        setDraggingType(undefined);
        return;
      }

      if (!type) {
        return;
      }

      const newNode = buildNewNode(type, position, getId, createNodeData);

      setNodes((existingNodes) => existingNodes.concat(newNode));
      const shouldSkipDialog = nodeTypeConfigs[newNode.type]?.skipDialog;
      if (!shouldSkipDialog) {
        openNodeDialog({ nodeId: newNode.id, nodeData: newNode.data });
      }
      setDraggingType(undefined);
    },
    [
      draggingTemplateId,
      ensureTemplateDetail,
      insertTemplate,
      openNodeDialog,
      screenToFlowPosition,
      setDraggingTemplateId,
      setDraggingType,
      setNodes,
      type,
    ],
  );

  // 실행 가능 조건 검사
  const runEligibility = useRunEligibility(nodes, edges);

  // 실행 중단
  const cancelRun = useCallback(() => {
    if (!isRunning) return;
    delayCancelAll();
    sseCancelAll();
    // 실행 중이던 노드를 실패로 표시
    setNodes((nodes) => markRunningNodesAsFailed(nodes));
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
    setRunGate(
      createRunGateState({
        runEligibility,
        isRunning,
        error,
        failedNodeIds,
      }),
    );
  }, [runEligibility, isRunning, error, failedNodeIds, setRunGate]);

  return (
    <div className="min-h-0 flex-1 relative" ref={reactFlowWrapper}>
      {activeTab === "graph" ? (
        <>
          <ReactFlow<SchemaNode, SchemaEdge>
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
          <TemplateGroupsOverlay groups={templateGroups} />
        </>
      ) : (
        <ResultsTab results={results} sessionId={sessionId} />
      )}
    </div>
  );
};
