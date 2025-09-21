import { describe, expect, it } from "vitest";
import type { Node } from "@xyflow/react";
import type { NodeData } from "@/features/flow/types/nodes";
import { createNodeData } from "@/features/flow/utils/node-factory";
import {
  RUN_STATUS,
  markAllNodesStatus,
  markFailed,
  markNodesStatus,
  markRunning,
  markSuccess,
} from "@/features/flow/utils/run-status";

const makeNode = (id: string): Node<NodeData> => ({
  id,
  type: "custom",
  position: { x: 0, y: 0 },
  data: { ...createNodeData("custom"), runStatus: RUN_STATUS.IDLE },
});

describe("실행 상태 유틸리티", () => {
  it("markAllNodesStatus는 모든 노드의 상태를 제공된 상태로 업데이트합니다", () => {
    const nodes = [makeNode("a"), makeNode("b")];

    const updated = markAllNodesStatus(nodes, RUN_STATUS.RUNNING);

    expect(updated).toHaveLength(2);
    for (const node of updated) {
      expect(node.data.runStatus).toBe(RUN_STATUS.RUNNING);
    }
    // original nodes remain untouched
    expect(nodes[0]!.data.runStatus).toBe(RUN_STATUS.IDLE);
  });

  it("markNodesStatus는 지정된 노드만 업데이트합니다", () => {
    const nodes = [makeNode("a"), makeNode("b"), makeNode("c")];
    const ids = new Set(["b"]);

    const updated = markNodesStatus(nodes, ids, RUN_STATUS.FAILED);

    expect(updated[0]!.data.runStatus).toBe(RUN_STATUS.IDLE);
    expect(updated[1]!.data.runStatus).toBe(RUN_STATUS.FAILED);
    expect(updated[2]!.data.runStatus).toBe(RUN_STATUS.IDLE);
  });

  it("단축 헬퍼는 예상된 상태를 설정합니다", () => {
    const nodes = [makeNode("a"), makeNode("b")];
    const ids = new Set(["a"]);

    expect(markRunning(nodes, ids)[0]!.data.runStatus).toBe(RUN_STATUS.RUNNING);
    expect(markSuccess(nodes, ids)[0]!.data.runStatus).toBe(RUN_STATUS.SUCCESS);
    expect(markFailed(nodes, ids)[0]!.data.runStatus).toBe(RUN_STATUS.FAILED);
  });
});
