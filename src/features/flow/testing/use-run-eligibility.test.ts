import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRunEligibility } from "@/features/flow/hooks/use-run-eligibility";
import type {
  FlowNodeType,
  SchemaEdge,
  SchemaNode,
} from "@/features/flow/types/nodes";
import { createNodeData } from "@/features/flow/utils/node-factory";

const makeNode = (id: string, type: FlowNodeType): SchemaNode => ({
  id,
  type,
  position: { x: 0, y: 0 },
  data: createNodeData(type),
});

const makeEdge = (id: string, source: string, target: string): SchemaEdge => ({
  id,
  source,
  target,
});

describe("useRunEligibility 훅 검증", () => {
  it("노드가 제공되지 않으면 에러를 반환합니다", () => {
    const { result } = renderHook(() => useRunEligibility([], []));
    expect(result.current).toEqual({ ok: false, reason: "노드가 없습니다." });
  });

  it("정확히 하나의 입력 노드가 필요합니다", () => {
    const nodes = [makeNode("a", "messageNode"), makeNode("b", "messageNode")];
    const { result } = renderHook(() => useRunEligibility(nodes, []));
    expect(result.current).toEqual({
      ok: false,
      reason: "시작 노드는 정확히 1개여야 합니다.",
    });
  });

  it("정확히 하나의 출력 노드가 필요합니다", () => {
    const nodes = [makeNode("a", "inputNode"), makeNode("b", "messageNode")];
    const { result } = renderHook(() => useRunEligibility(nodes, []));
    expect(result.current).toEqual({
      ok: false,
      reason: "종료 노드는 정확히 1개여야 합니다.",
    });
  });

  it("사이클을 감지합니다", () => {
    const nodes = [
      makeNode("input", "inputNode"),
      makeNode("processor", "messageNode"),
      makeNode("output", "outputNode"),
    ];
    const edges = [
      makeEdge("e1", "input", "processor"),
      makeEdge("e2", "processor", "input"),
      makeEdge("e3", "processor", "output"),
    ];

    const { result } = renderHook(() => useRunEligibility(nodes, edges));
    expect(result.current).toEqual({
      ok: false,
      reason: "사이클이 존재합니다.",
    });
  });

  it("모든 노드는 시작→종료 경로 위에 있어야 합니다", () => {
    const nodes = [
      makeNode("input", "inputNode"),
      makeNode("processor", "messageNode"),
      makeNode("output", "outputNode"),
      makeNode("isolated", "messageNode"),
    ];
    const edges = [
      makeEdge("e1", "input", "processor"),
      makeEdge("e2", "processor", "output"),
    ];

    const { result } = renderHook(() => useRunEligibility(nodes, edges));
    expect(result.current).toEqual({
      ok: false,
      reason: "모든 노드가 시작→종료 경로 위에 있어야 합니다.",
    });
  });

  it("플로우가 유효하면 ok를 반환합니다", () => {
    const nodes = [
      makeNode("input", "inputNode"),
      makeNode("processor", "messageNode"),
      makeNode("output", "outputNode"),
    ];
    const edges = [
      makeEdge("e1", "input", "processor"),
      makeEdge("e2", "processor", "output"),
    ];

    const { result } = renderHook(() => useRunEligibility(nodes, edges));
    expect(result.current).toEqual({ ok: true, reason: null });
  });
});
