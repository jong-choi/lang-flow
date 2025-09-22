import { describe, expect, it } from "vitest";
import type { Edge, Node } from "@xyflow/react";
import type { FlowNodeType, NodeData } from "@/features/flow/types/nodes";
import {
  buildAdjacency,
  computeLevels,
  forwardReachable,
  hasCycle,
  reverseReachable,
} from "@/features/flow/utils/graph";
import { createNodeData } from "@/features/flow/utils/node-factory";

const makeNode = (id: string, type: FlowNodeType): Node<NodeData> => ({
  id,
  type,
  position: { x: 0, y: 0 },
  data: createNodeData(type),
});

const makeEdge = (id: string, source: string, target: string): Edge => ({
  id,
  source,
  target,
});

describe("그래프 유틸리티", () => {
  const nodes: Node<NodeData>[] = [
    makeNode("input", "inputNode"),
    makeNode("branch-a", "messageNode"),
    makeNode("branch-b", "messageNode"),
    makeNode("output", "outputNode"),
  ];

  const edges: Edge[] = [
    makeEdge("e1", "input", "branch-a"),
    makeEdge("e2", "input", "branch-b"),
    makeEdge("e3", "branch-a", "output"),
    makeEdge("e4", "branch-b", "output"),
  ];

  it("buildAdjacency는 들어오는/나가는 맵과 진입 차수를 반환합니다", () => {
    const adjacency = buildAdjacency(nodes, edges);

    expect(adjacency.outMap).toEqual({
      input: ["branch-a", "branch-b"],
      "branch-a": ["output"],
      "branch-b": ["output"],
      output: [],
    });
    expect(adjacency.inMap).toEqual({
      input: [],
      "branch-a": ["input"],
      "branch-b": ["input"],
      output: ["branch-a", "branch-b"],
    });
    expect(adjacency.indegree).toEqual({
      input: 0,
      "branch-a": 1,
      "branch-b": 1,
      output: 2,
    });
  });

  it("hasCycle은 그래프에서 순환을 감지합니다", () => {
    const dagAdjacency = buildAdjacency(nodes, edges);
    expect(hasCycle(dagAdjacency)).toBe(false);

    const edgesWithCycle = [...edges, makeEdge("cycle", "branch-a", "input")];
    const cycleAdjacency = buildAdjacency(nodes, edgesWithCycle);
    expect(hasCycle(cycleAdjacency)).toBe(true);
  });

  it("computeLevels는 위상 정렬 순서로 노드를 그룹화합니다", () => {
    const levels = computeLevels(nodes, edges);
    expect(levels).toEqual([["input"], ["branch-a", "branch-b"], ["output"]]);
  });

  it("forwardReachable는 시작 노드에서 도달 가능한 노드를 반환합니다", () => {
    const adjacency = buildAdjacency(nodes, edges);
    const reachable = forwardReachable("input", adjacency);
    expect(reachable).toEqual(
      new Set(["input", "branch-a", "branch-b", "output"]),
    );
  });

  it("reverseReachable는 끝 노드에 도달할 수 있는 노드를 반환합니다", () => {
    const adjacency = buildAdjacency(nodes, edges);
    const reachable = reverseReachable("output", adjacency);
    expect(reachable).toEqual(
      new Set(["input", "branch-a", "branch-b", "output"]),
    );
  });
});
