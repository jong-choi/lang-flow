import type { StateCreator } from "zustand";
import type { NodeData } from "@/features/flow/types/nodes";
import type { FlowGeneratorState } from "../flow-store";

interface NodeDialogState {
  isOpen: boolean;
  targetNodeId: string | null;
  nodeData: NodeData | null;
}

const initialNodeDialogState: NodeDialogState = {
  isOpen: false,
  targetNodeId: null,
  nodeData: null,
};

export interface NodeDialogSlice {
  nodeDialog: NodeDialogState;
  openNodeDialog: (payload: { nodeId: string; nodeData: NodeData }) => void;
  closeNodeDialog: () => void;
  updateNodeDialogData: (nodeData: NodeData) => void;
}

export const createNodeDialogSlice: StateCreator<
  FlowGeneratorState,
  [],
  [],
  NodeDialogSlice
> = (set) => ({
  nodeDialog: initialNodeDialogState,
  openNodeDialog: ({ nodeId, nodeData }) =>
    set((prevState) => ({
      ...prevState,
      nodeDialog: {
        isOpen: true,
        targetNodeId: nodeId,
        nodeData,
      },
    })),
  closeNodeDialog: () =>
    set((prevState) => ({
      ...prevState,
      nodeDialog: initialNodeDialogState,
    })),
  updateNodeDialogData: (nodeData) =>
    set((prevState) => {
      if (!prevState.nodeDialog.targetNodeId) {
        return prevState;
      }

      return {
        ...prevState,
        nodeDialog: {
          ...prevState.nodeDialog,
          nodeData,
        },
      };
    }),
});
