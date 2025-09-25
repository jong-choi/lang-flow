import { useCallback } from "react";
import { toast } from "sonner";
import type { Edge, IsValidConnection } from "@xyflow/react";
import type { SchemaNode } from "@/features/flow/types/graph";

export const useIsValidConnection = (
  nodes: SchemaNode[],
): IsValidConnection<Edge> => {
  return useCallback<IsValidConnection<Edge>>(
    (connectionItem) => {
      const source = connectionItem.source;
      const target = connectionItem.target;

      if (!source || !target) {
        toast.error("연결 오류: 소스/타겟이 올바르지 않습니다.");
        return false;
      }

      const sourceHandle = connectionItem.sourceHandle ?? null;
      const targetHandle = connectionItem.targetHandle ?? null;

      if (source === target && sourceHandle === targetHandle && sourceHandle) {
        toast.error("같은 노드의 동일한 핸들에는 연결할 수 없습니다.");
        return false;
      }

      const sourceNode = nodes.find((node) => node.id === source);
      const targetNode = nodes.find((node) => node.id === target);

      if (!sourceNode || !targetNode) {
        toast.error("연결 오류: 노드 정보를 찾을 수 없습니다.");
        return false;
      }

      if (sourceNode.type === "inputNode" && targetNode.type === "inputNode") {
        toast.error("입력 노드끼리는 연결할 수 없습니다.");
        return false;
      }

      if (sourceNode.type === "outputNode") {
        toast.error("출력 노드에서는 연결을 시작할 수 없습니다.");
        return false;
      }

      // 분기 ↔ 합성 간 연결 금지
      const isBranchInvolved =
        sourceNode.type === "singleInputMultiOutput" ||
        targetNode.type === "singleInputMultiOutput";
      const isMergeInvolved =
        sourceNode.type === "multiInputSingleOutput" ||
        targetNode.type === "multiInputSingleOutput";
      if (isBranchInvolved && isMergeInvolved) {
        toast.error("분기 노드와 합성 노드는 직접 연결할 수 없습니다.");
        return false;
      }

      return true;
    },
    [nodes],
  );
};
