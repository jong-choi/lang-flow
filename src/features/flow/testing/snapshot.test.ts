import { describe, expect, it } from "vitest";
import type {
  FlowNodeType,
  SchemaEdge,
  SchemaNode,
} from "@/features/flow/types/nodes";
import { createNodeData } from "@/features/flow/utils/node-factory";
import { buildSnapshot } from "@/features/flow/utils/snapshot";

const makeNode = (id: string, type: FlowNodeType): SchemaNode => ({
  id,
  type,
  position: { x: 10, y: 20 },
  data: { ...createNodeData(type), customField: "value" },
});

const makeEdge = (id: string, source: string, target: string): SchemaEdge => ({
  id,
  source,
  target,
});

describe("스냅샷 생성", () => {
  it("최소한의 노드 및 엣지 페이로드를 반환합니다", () => {
    const nodes: SchemaNode[] = [
      makeNode("n1", "inputNode"),
      makeNode("n2", "outputNode"),
    ];
    const edges: SchemaEdge[] = [makeEdge("e1", "n1", "n2")];

    const snapshot = buildSnapshot(nodes, edges);

    expect(snapshot).toEqual({
      nodes: [
        {
          id: "n1",
          type: "inputNode",
          position: { x: 10, y: 20 },
          data: expect.objectContaining({
            label: expect.any(String),
            customField: "value",
          }),
        },
        {
          id: "n2",
          type: "outputNode",
          position: { x: 10, y: 20 },
          data: expect.objectContaining({
            label: expect.any(String),
            customField: "value",
          }),
        },
      ],
      edges: [
        {
          id: "e1",
          source: "n1",
          target: "n2",
        },
      ],
    });
  });
});
