import type { StateCreator } from "zustand";
import type { NodeData } from "@/features/flow/types/nodes";

export type NodeDialogTrigger =
  | "palette-drop"
  | "node-menu"
  | "template-insert";

interface NodeDialogState {
  isOpen: boolean;
  targetNodeId: string | null;
  nodeData: NodeData | null;
  trigger: NodeDialogTrigger | null;
}

interface PromptDialogState {
  isOpen: boolean;
}

const initialNodeDialogState: NodeDialogState = {
  isOpen: false,
  targetNodeId: null,
  nodeData: null,
  trigger: null,
};

const initialPromptDialogState: PromptDialogState = {
  isOpen: false,
};

export interface DialogSlice {
  nodeDialog: NodeDialogState;
  promptDialog: PromptDialogState;
  openNodeDialog: (payload: {
    nodeId: string;
    nodeData: NodeData;
    trigger: NodeDialogTrigger;
  }) => void;
  closeNodeDialog: () => void;
  updateNodeDialogData: (nodeData: NodeData) => void;
  setPromptDialogOpen: (open: boolean) => void;
}

export const createDialogSlice: StateCreator<DialogSlice> = (set) => ({
  nodeDialog: initialNodeDialogState,
  promptDialog: initialPromptDialogState,
  openNodeDialog: ({ nodeId, nodeData, trigger }) =>
    set((prevState) => {
      const nextDialog: NodeDialogState = {
        isOpen: true,
        targetNodeId: nodeId,
        nodeData,
        trigger,
      };

      const previousDialog = prevState.nodeDialog;
      if (
        previousDialog.isOpen &&
        previousDialog.targetNodeId === nodeId &&
        previousDialog.nodeData === nodeData &&
        previousDialog.trigger === trigger
      ) {
        return prevState;
      }

      return {
        nodeDialog: nextDialog,
      };
    }),
  closeNodeDialog: () =>
    set((prevState) => {
      if (!prevState.nodeDialog.isOpen) {
        return prevState;
      }

      return {
        nodeDialog: initialNodeDialogState,
      };
    }),
  updateNodeDialogData: (nodeData) =>
    set((prevState) => {
      if (!prevState.nodeDialog.isOpen || !prevState.nodeDialog.targetNodeId) {
        return prevState;
      }

      if (prevState.nodeDialog.nodeData === nodeData) {
        return prevState;
      }

      return {
        nodeDialog: {
          ...prevState.nodeDialog,
          nodeData,
        },
      };
    }),
  setPromptDialogOpen: (open) =>
    set((prevState) => {
      if (prevState.promptDialog.isOpen === open) {
        return prevState;
      }

      return {
        promptDialog: {
          ...prevState.promptDialog,
          isOpen: open,
        },
      };
    }),
});
