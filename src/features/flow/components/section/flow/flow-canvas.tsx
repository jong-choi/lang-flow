"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DragEvent } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import {
  type Connection,
  type IsValidConnection,
  addEdge,
  reconnectEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FlowGraphView } from "@/features/flow/components/section/flow/ui/flow-graph-view";
import { FlowResultsPanel } from "@/features/flow/components/section/message/results-panel";
import { nodeTypeConfigs } from "@/features/flow/constants/node-config";
import { useDelayApi } from "@/features/flow/hooks/use-delay-api";
import { useFlowExecution } from "@/features/flow/hooks/use-flow-execution";
import { useIsValidConnection } from "@/features/flow/hooks/use-is-valid-connection";
import { useRunEligibility } from "@/features/flow/hooks/use-run-eligibility";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";
import type { SchemaEdge, SchemaNode } from "@/features/flow/types/graph";
import type { WorkflowDetail } from "@/features/flow/types/workflow";
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

export const FlowCanvas = () => {
  const edgeReconnectSuccessful = useRef(true);
  const initialNodes = useFlowGeneratorStore.use.initialNodes();
  const initialEdges = useFlowGeneratorStore.use.initialEdges();
  const activeTab = useFlowGeneratorStore.use.activeTab();
  const setActiveTab = useFlowGeneratorStore.use.setActiveTab();
  const [nodes, setNodes, onNodesChange] = useNodesState<SchemaNode>(
    initialNodes ?? createDefaultNodes(createNodeData),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<SchemaEdge>(
    initialEdges ?? [],
  );
  const { screenToFlowPosition } = useReactFlow();
  const draggingType = useFlowGeneratorStore.use.draggingType();
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
    onComplete: () => setActiveTab("results"),
  });

  const [lastPrompt, setLastPrompt] = useState<string>("");
  const validateConnection = useIsValidConnection(nodes);
  const isValidConnection = useCallback<IsValidConnection<SchemaEdge>>(
    (candidate: Parameters<IsValidConnection<SchemaEdge>>[0]) => {
      const normalized: Connection =
        "id" in candidate
          ? {
              source: candidate.source,
              sourceHandle: candidate.sourceHandle ?? null,
              target: candidate.target,
              targetHandle: candidate.targetHandle ?? null,
            }
          : candidate;

      return validateConnection(normalized);
    },
    [validateConnection],
  );

  const onConnect = useCallback(
    (connectionParams: Connection) => {
      if (isValidConnection(connectionParams)) {
        setEdges((existingEdges) => addEdge(connectionParams, existingEdges));
      }
    },
    [setEdges, isValidConnection],
  );

  const insertTemplate = useCallback(
    (template: WorkflowDetail, dropPosition: { x: number; y: number }) => {
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

  const onReconnect = useCallback(
    (oldEdge: SchemaEdge, newConnection: Connection) => {
      if (!isValidConnection(newConnection)) {
        edgeReconnectSuccessful.current = false;
        return;
      }
      edgeReconnectSuccessful.current = true;
      setEdges((existingEdges) =>
        reconnectEdge(oldEdge, newConnection, existingEdges),
      );
    },
    [setEdges, isValidConnection],
  );

  const onReconnectEnd = useCallback(
    (_event: MouseEvent | TouchEvent, edge: SchemaEdge) => {
      if (!edgeReconnectSuccessful.current) {
        setEdges((existingEdges) =>
          existingEdges.filter((candidate) => candidate.id !== edge.id),
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
    if (initialNodes) {
      hasHydratedNodesFromProps.current = true;
      setNodes(duplicateNodes(initialNodes));
      return;
    }

    if (hasHydratedNodesFromProps.current) {
      hasHydratedNodesFromProps.current = false;
      setNodes(createDefaultNodes(createNodeData));
    }
  }, [initialNodes, setNodes]);

  useEffect(() => {
    if (initialEdges) {
      hasHydratedEdgesFromProps.current = true;
      setEdges(duplicateEdges(initialEdges));
      return;
    }

    if (hasHydratedEdgesFromProps.current) {
      hasHydratedEdgesFromProps.current = false;
      setEdges([]);
    }
  }, [initialEdges, setEdges]);

  useEffect(() => {
    setTemplateGroups((groups) => pruneEmptyTemplateGroups(groups, nodes));
  }, [nodes]);

  const onDragOver = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = draggingTemplateId ? "copy" : "move";
    },
    [draggingTemplateId],
  );

  const onDrop = useCallback(
    async (dropEvent: DragEvent) => {
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

      if (!draggingType) {
        return;
      }

      const newNode = buildNewNode(
        draggingType,
        position,
        getId,
        createNodeData,
      );

      setNodes((existingNodes) => existingNodes.concat(newNode));
      const shouldSkipDialog = nodeTypeConfigs[newNode.type]?.skipDialog;
      if (!shouldSkipDialog) {
        openNodeDialog({
          nodeId: newNode.id,
          nodeData: newNode.data,
          trigger: "palette-drop",
        });
      }
      setDraggingType(undefined);
    },
    [
      draggingTemplateId,
      draggingType,
      ensureTemplateDetail,
      insertTemplate,
      openNodeDialog,
      screenToFlowPosition,
      setDraggingTemplateId,
      setDraggingType,
      setNodes,
    ],
  );

  const runEligibility = useRunEligibility(nodes, edges);

  const cancelRun = useCallback(() => {
    if (!isRunning) return;
    delayCancelAll();
    sseCancelAll();
    setNodes((existingNodes) => markRunningNodesAsFailed(existingNodes));
  }, [isRunning, delayCancelAll, sseCancelAll, setNodes]);

  const runFlow = useCallback(
    async (prompt: string) => {
      if (!runEligibility.ok || isRunning) return;

      try {
        setIsRunning(true);
        setLastPrompt(prompt);
        await runFlowExec(prompt, nodes, edges);
      } catch (error) {
        console.error("플로우 실행 오류:", error);
      } finally {
        setIsRunning(false);
      }
    },
    [runEligibility.ok, isRunning, runFlowExec, nodes, edges, setIsRunning],
  );

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
    <div className="relative min-h-0 flex-1">
      {activeTab === "graph" ? (
        <FlowGraphView
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
          templateGroups={templateGroups}
        />
      ) : (
        <FlowResultsPanel results={results} sessionId={sessionId} />
      )}
    </div>
  );
};
