import type { StateCreator } from "zustand";
import type { SchemaEdge, SchemaNode } from "@/features/flow/types/nodes";
import type { FlowGeneratorState } from "../flow-store";

export interface CanvasSlice {
  canvasNodes: SchemaNode[];
  canvasEdges: SchemaEdge[];
  setCanvasState: (nodes: SchemaNode[], edges: SchemaEdge[]) => void;
}

export const createCanvasSlice: StateCreator<
  FlowGeneratorState,
  [],
  [],
  CanvasSlice
> = (set) => ({
  canvasNodes: [],
  canvasEdges: [],
  setCanvasState: (nodes, edges) =>
    set((prevState) => ({
      ...prevState,
      canvasNodes: nodes,
      canvasEdges: edges,
    })),
});
