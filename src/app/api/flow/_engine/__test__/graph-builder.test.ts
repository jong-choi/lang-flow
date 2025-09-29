import { describe, expect, it } from "vitest";
import type {
  NodeData,
  ReactFlowEdge,
  ReactFlowNode,
} from "@/features/flow/types/graph";
import { buildGraphFromFlow } from "../graph-builder";

const baseNodeData: NodeData = {
  label: "",
  emoji: "",
  job: "",
  runStatus: "idle",
};

const createNode = (overrides: Partial<ReactFlowNode>): ReactFlowNode => ({
  id: "node-id",
  type: "messageNode",
  position: { x: 0, y: 0 },
  ...overrides,
  data: { ...baseNodeData, ...overrides.data },
});

const createEdge = (overrides: Partial<ReactFlowEdge>): ReactFlowEdge => ({
  id: "edge-id",
  source: "node-id",
  target: "node-id-2",
  type: "custom",
  ...overrides,
});

describe("buildGraphFromFlow", () => {
  it("search-node가 구글 서치와 맵핑되어야 합니다", () => {
    const searchNode = createNode({
      id: "search-node",
      type: "searchNode",
      data: {
        label: "search node",
        emoji: "",
        job: "검색",
        nodeType: "searchNode",
      },
    });

    const outputNode = createNode({
      id: "output-node",
      type: "outputNode",
      data: {
        label: "output",
        emoji: "",
        job: "종료",
        nodeType: "outputNode",
      },
      position: { x: 200, y: 0 },
    });

    const edges: ReactFlowEdge[] = [
      createEdge({
        id: "edge-1",
        source: searchNode.id,
        target: outputNode.id,
      }),
    ];

    const { typeMap } = buildGraphFromFlow([searchNode, outputNode], edges);

    expect(typeMap[searchNode.id]).toBe("google_search");
    expect(typeMap[outputNode.id]).toBe("output");
  });

  it("node.type을 기준으로 처리해야 합니다", () => {
    const staleSearchNode = createNode({
      id: "search-node",
      type: "searchNode",
      data: {
        label: "search node",
        emoji: "",
        job: "채팅", // 구식 노드
        nodeType: "searchNode",
      },
    });

    const outputNode = createNode({
      id: "output-node",
      type: "outputNode",
      data: {
        label: "output",
        emoji: "",
        job: "종료",
        nodeType: "outputNode",
      },
      position: { x: 200, y: 0 },
    });

    const edges: ReactFlowEdge[] = [
      createEdge({
        id: "edge-1",
        source: staleSearchNode.id,
        target: outputNode.id,
      }),
    ];

    const { typeMap } = buildGraphFromFlow(
      [staleSearchNode, outputNode],
      edges,
    );

    expect(typeMap[staleSearchNode.id]).toBe("google_search");
  });
});
