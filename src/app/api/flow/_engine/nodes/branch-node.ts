import type { FlowStateAnnotation } from "@/app/api/flow/_engine/graph-builder";

/**
 * 분기 노드 - 입력을 여러 분기로 전송합니다.
 * 연결된 모든 출력 노드에 현재 상태를 전송합니다.
 */
export async function branchNode(
  state: typeof FlowStateAnnotation.State,
  nodeId: string,
  targetNodeIds: string[], // 분기할 대상 노드 ID들
): Promise<Partial<typeof state>> {
  console.log("=== Executing branch node ===");
  console.log("Node ID:", nodeId);
  console.log("Target nodes:", targetNodeIds);
  console.log("Current state:", JSON.stringify(state, null, 2));

  try {
    // 타겟이 없으면 빈 배열을 반환하면 런타임 에러가 나므로, 상태 업데이트 객체를 반환
    if (!targetNodeIds || targetNodeIds.length === 0) {
      console.warn(
        "분기 노드에 나가는 대상이 없습니다. 아무 작업도 하지 않는 상태 업데이트를 반환합니다.",
      );
      return {
        nodeOutputs: {
          ...state.nodeOutputs,
          [nodeId]: {
            type: "branch",
            targetNodes: [],
            skipped: true,
            reason: "no targets",
            timestamp: new Date().toISOString(),
          },
        },
      };
    }

    // 노드는 객체(부분 상태 업데이트)만 반환해야 합니다.
    // 분기는 그래프의 다중 outgoing edge에 의해 병렬 실행됩니다.
    return {
      nodeOutputs: {
        ...state.nodeOutputs,
        [nodeId]: {
          type: "branch",
          targetNodes: targetNodeIds,
          timestamp: new Date().toISOString(),
        },
      },
    };
  } catch (error) {
    console.error("분기노드 에러:", error);
    return {
      nodeOutputs: {
        ...state.nodeOutputs,
        [nodeId]: {
          type: "branch",
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      },
    };
  }
}
