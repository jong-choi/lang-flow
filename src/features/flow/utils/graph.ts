import type { Edge, Node } from "@xyflow/react";
import type { NodeData } from "@/features/flow/types/nodes";

export type Adjacency = {
  outMap: Record<string, string[]>;
  inMap: Record<string, string[]>;
  indegree: Record<string, number>;
};

export const buildAdjacency = (
  nodes: Node<NodeData>[],
  edges: Edge[],
): Adjacency => {
  const nodeIdSet = new Set(nodes.map((n) => n.id));
  const outgoing: Record<string, string[]> = {};
  const incoming: Record<string, string[]> = {};
  const indegree: Record<string, number> = {};

  for (const id of nodeIdSet) {
    outgoing[id] = [];
    incoming[id] = [];
    indegree[id] = 0;
  }

  for (const edge of edges) {
    if (!nodeIdSet.has(edge.source) || !nodeIdSet.has(edge.target)) continue;
    outgoing[edge.source].push(edge.target);
    incoming[edge.target].push(edge.source);
    indegree[edge.target] += 1;
  }

  return { outMap: outgoing, inMap: incoming, indegree };
};

export const hasCycle = (adj: Adjacency): boolean => {
  const indegreeCopy: Record<string, number> = { ...adj.indegree };
  const zeroIndegreeQueue: string[] = [];

  Object.keys(indegreeCopy).forEach((id) => {
    if (indegreeCopy[id] === 0) zeroIndegreeQueue.push(id);
  });

  let processedCount = 0;
  while (zeroIndegreeQueue.length) {
    const nodeId = zeroIndegreeQueue.shift();
    if (nodeId === undefined) continue;
    processedCount += 1;
    for (const neighbour of adj.outMap[nodeId] ?? []) {
      indegreeCopy[neighbour] -= 1;
      if (indegreeCopy[neighbour] === 0) zeroIndegreeQueue.push(neighbour);
    }
  }

  return processedCount !== Object.keys(indegreeCopy).length;
};

export const computeLevels = (
  nodes: Node<NodeData>[],
  edges: Edge[],
): string[][] => {
  const { outMap, indegree } = buildAdjacency(nodes, edges);
  const indegreeCopy: Record<string, number> = { ...indegree };
  const queue: string[] = [];

  Object.keys(indegreeCopy).forEach((id) => {
    if (indegreeCopy[id] === 0) queue.push(id);
  });

  const levels: string[][] = [];
  while (queue.length) {
    const levelSize = queue.length;
    const levelNodes: string[] = [];
    for (let i = 0; i < levelSize; i++) {
      const nodeId = queue.shift();
      if (nodeId === undefined) continue;
      levelNodes.push(nodeId);
      for (const neighbour of outMap[nodeId] ?? []) {
        indegreeCopy[neighbour] -= 1;
        if (indegreeCopy[neighbour] === 0) queue.push(neighbour);
      }
    }
    levels.push(levelNodes);
  }

  return levels;
};

export const forwardReachable = (
  startId: string,
  adj: Adjacency,
): Set<string> => {
  const visited = new Set<string>();
  const stack = [startId];
  while (stack.length) {
    const current = stack.pop();
    if (current === undefined) continue;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const neighbour of adj.outMap[current] ?? []) stack.push(neighbour);
  }
  return visited;
};

export const reverseReachable = (
  endId: string,
  adj: Adjacency,
): Set<string> => {
  const visited = new Set<string>();
  const stack = [endId];
  while (stack.length) {
    const current = stack.pop();
    if (current === undefined) continue;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const predecessor of adj.inMap[current] ?? []) stack.push(predecessor);
  }
  return visited;
};
