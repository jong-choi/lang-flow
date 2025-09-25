"use client";

import { useMemo } from "react";
import type { SchemaEdge, SchemaNode } from "@/features/flow/types/graph";
import {
  buildAdjacency,
  forwardReachable,
  hasCycle,
  reverseReachable,
} from "@/features/flow/utils/graph";

export function useRunEligibility(
  nodes: SchemaNode[],
  edges: SchemaEdge[],
): { ok: boolean; reason: string | null } {
  return useMemo(() => {
    if (!nodes || nodes.length === 0) {
      return { ok: false, reason: "노드가 없습니다." } as const;
    }

    const inputNodeList = nodes.filter((node) => node.type === "inputNode");
    const outputNodeList = nodes.filter((node) => node.type === "outputNode");

    if (inputNodeList.length !== 1)
      return {
        ok: false,
        reason: "시작 노드는 정확히 1개여야 합니다.",
      } as const;
    if (outputNodeList.length !== 1)
      return {
        ok: false,
        reason: "종료 노드는 정확히 1개여야 합니다.",
      } as const;

    const adj = buildAdjacency(nodes, edges);
    if (hasCycle(adj))
      return { ok: false, reason: "사이클이 존재합니다." } as const;

    const startId = inputNodeList[0]!.id;
    const reachable = forwardReachable(startId, adj);
    const endId = outputNodeList[0]!.id;
    const revReach = reverseReachable(endId, adj);

    for (const node of nodes) {
      const onMainPath = reachable.has(node.id) && revReach.has(node.id);
      if (!onMainPath) {
        return {
          ok: false,
          reason: "모든 노드가 시작→종료 경로 위에 있어야 합니다.",
        } as const;
      }
    }

    if (!edges || edges.length === 0)
      return { ok: false, reason: "연결(엣지)이 필요합니다." } as const;

    return { ok: true, reason: null } as const;
  }, [nodes, edges]);
}
