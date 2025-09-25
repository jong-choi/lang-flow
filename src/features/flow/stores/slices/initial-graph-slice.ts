import type { StateCreator } from "zustand";
import type { SchemaEdge, SchemaNode } from "@/features/flow/types/graph";

export type InitialGraphSlice = {
  initialNodes: SchemaNode[] | null;
  initialEdges: SchemaEdge[] | null;
};

export const createInitialGraphSlice: StateCreator<InitialGraphSlice> = () => ({
  initialNodes: null,
  initialEdges: null,
});
