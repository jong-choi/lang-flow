import type { StateCreator } from "zustand";
import type { SchemaEdge, SchemaNode } from "@/features/flow/types/graph";

export interface CanvasSlice {
  canvasNodes: SchemaNode[];
  canvasEdges: SchemaEdge[];
  setCanvasState: (nodes: SchemaNode[], edges: SchemaEdge[]) => void;
}

export const createCanvasSlice: StateCreator<CanvasSlice> = (set) => ({
  canvasNodes: [],
  canvasEdges: [],
  setCanvasState: (nodes, edges) =>
    set({
      canvasNodes: nodes,
      canvasEdges: edges,
    }),
});
