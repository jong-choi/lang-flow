"use client";

/**
 * 노드별 연결 제한을 계산하는 커스텀 훅.
 */
import { useNodeConnections } from "@xyflow/react";
import { connectionLimits } from "@/features/flow/constants/node-config";
import type {
  ConnectionStateMap,
  FlowNodeType,
} from "@/features/flow/types/nodes";

export const useConnectionLimits = (nodeType: FlowNodeType, nodeId: string) => {
  const limits = connectionLimits[nodeType];

  const targetConnections = useNodeConnections({
    id: nodeId,
    handleType: "target",
  });
  const sourceConnections = useNodeConnections({
    id: nodeId,
    handleType: "source",
  });

  const targetCountById: Record<string, number> = {};
  const sourceCountById: Record<string, number> = {};

  for (const connection of targetConnections) {
    const key = connection.targetHandle ?? "";
    targetCountById[key] = (targetCountById[key] ?? 0) + 1;
  }

  for (const connection of sourceConnections) {
    const key = connection.sourceHandle ?? "";
    sourceCountById[key] = (sourceCountById[key] ?? 0) + 1;
  }

  const connectionStates: ConnectionStateMap = {};

  if (limits?.inputs) {
    for (const { id, max } of limits.inputs) {
      const current = targetCountById[id] ?? 0;
      connectionStates[id] = {
        current,
        max,
        isConnectable: current < max,
      };
    }
  }

  if (limits?.outputs) {
    for (const { id, max } of limits.outputs) {
      const current = sourceCountById[id] ?? 0;
      connectionStates[id] = {
        current,
        max,
        isConnectable: current < max,
      };
    }
  }

  return connectionStates;
};
