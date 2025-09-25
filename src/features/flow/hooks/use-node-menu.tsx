"use client";

/**
 * 노드 우측 상단 메뉴에서 제공하는 편집, 복제, 연결 추가, 삭제 동작을 캡슐화한 훅.
 */
import { useCallback, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { type NodeEditFormValues } from "@/features/flow/components/nodes/ui/edit-dialog";
import { nodeTypeConfigs } from "@/features/flow/constants/node-config";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";
import type {
  NodeData,
  SchemaEdge,
  SchemaNode,
} from "@/features/flow/types/graph";
import { createNodeData, getId } from "@/features/flow/utils/node-factory";

export const useNodeMenu = (id: string) => {
  const { setNodes, setEdges, getNodes } = useReactFlow<
    SchemaNode,
    SchemaEdge
  >();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const nodeDialog = useFlowGeneratorStore.use.nodeDialog();
  const openNodeDialog = useFlowGeneratorStore.use.openNodeDialog();
  const closeNodeDialog = useFlowGeneratorStore.use.closeNodeDialog();
  const updateNodeDialogData = useFlowGeneratorStore.use.updateNodeDialogData();
  const isCurrentNodeDialogTarget = nodeDialog.targetNodeId === id;

  const handleDelete = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) =>
      edges.filter((edge) => edge.source !== id && edge.target !== id),
    );
    setIsMenuOpen(false);
  }, [id, setEdges, setNodes]);

  const handleEdit = useCallback(
    (currentData: NodeData) => {
      openNodeDialog({
        nodeId: id,
        nodeData: currentData,
        trigger: "node-menu",
      });
      setIsMenuOpen(false);
    },
    [id, openNodeDialog],
  );

  const handleEditSubmit = useCallback(
    (values: NodeEditFormValues) => {
      let updatedNodeData: NodeData | null = null;

      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id !== id) {
            return node;
          }

          const nextData: NodeData = {
            ...node.data,
            label: values.label,
          };

          if (typeof values.template === "string") {
            nextData.template = values.template;
          } else if ("template" in nextData) {
            delete nextData.template;
          }

          if (typeof values.model === "string" && values.model.length > 0) {
            nextData.model = values.model;
          } else if ("model" in nextData) {
            delete nextData.model;
          }

          updatedNodeData = nextData;

          return {
            ...node,
            data: nextData,
          };
        }),
      );

      if (updatedNodeData) {
        updateNodeDialogData(updatedNodeData);
      }

      closeNodeDialog();
    },
    [closeNodeDialog, id, setNodes, updateNodeDialogData],
  );

  const handleEditDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open && isCurrentNodeDialogTarget) {
        closeNodeDialog();
      }
    },
    [closeNodeDialog, isCurrentNodeDialogTarget],
  );

  const handleDuplicate = useCallback(
    (currentData: NodeData) => {
      const currentNodes = getNodes();
      const currentNode = currentNodes.find((node) => node.id === id);

      if (currentNode) {
        const newNode: SchemaNode = {
          id: getId(),
          type: currentData.nodeType ?? "messageNode",
          position: {
            x: currentNode.position.x + 50,
            y: currentNode.position.y + 50,
          },
          data: {
            ...currentData,
            label: `${currentData.label} (복사)`,
          },
        };

        setNodes((nodes) => [...nodes, newNode]);
      }
      setIsMenuOpen(false);
    },
    [getNodes, id, setNodes],
  );

  const handleAddConnection = useCallback(() => {
    const currentNodes = getNodes();
    const currentNode = currentNodes.find((node) => node.id === id);

    if (currentNode) {
      const newNodeId = getId();
      const newNode: SchemaNode = {
        id: newNodeId,
        type: "messageNode",
        position: {
          x: currentNode.position.x + 200,
          y: currentNode.position.y,
        },
        data: createNodeData("messageNode"),
      };

      const newEdge: SchemaEdge = {
        id: `${id}-${newNodeId}`,
        source: id,
        target: newNodeId,
      };

      setNodes((nodes) => [...nodes, newNode]);
      const shouldSkipDialog = nodeTypeConfigs[newNode.type]?.skipDialog;
      if (!shouldSkipDialog) {
        openNodeDialog({
          nodeId: newNode.id,
          nodeData: newNode.data,
          trigger: "node-menu",
        });
      }
      setEdges((edges) => [...edges, newEdge]);
    }

    setIsMenuOpen(false);
  }, [getNodes, id, openNodeDialog, setEdges, setNodes]);

  return {
    isMenuOpen,
    setIsMenuOpen,
    handleDelete,
    handleEdit,
    handleDuplicate,
    handleAddConnection,
    editDialog: {
      open: isCurrentNodeDialogTarget && nodeDialog.isOpen,
      nodeData: isCurrentNodeDialogTarget ? nodeDialog.nodeData : null,
      onSubmit: handleEditSubmit,
      onOpenChange: handleEditDialogOpenChange,
    },
  };
};
