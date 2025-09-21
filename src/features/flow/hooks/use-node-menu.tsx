"use client";

/**
 * 노드 우측 상단 메뉴에서 제공하는 편집, 복제, 연결 추가, 삭제 동작을 캡슐화한 훅.
 */
import { useCallback, useState } from "react";
import { type Edge, type Node, useReactFlow } from "@xyflow/react";
import {
  DEFAULT_MODEL,
  type EditNodeFormValues,
} from "@/features/flow/components/nodes/ui/edit-dialog";
import type { NodeData } from "@/features/flow/types/nodes";
import { createNodeData, getId } from "@/features/flow/utils/node-factory";

export const useNodeMenu = (id: string) => {
  const { setNodes, setEdges, getNodes } = useReactFlow();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingNodeData, setEditingNodeData] = useState<NodeData | null>(null);

  const closeEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingNodeData(null);
  }, []);

  const handleDelete = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) =>
      edges.filter((edge) => edge.source !== id && edge.target !== id),
    );
    setIsMenuOpen(false);
  }, [id, setEdges, setNodes]);

  const handleEdit = useCallback(
    (currentData: NodeData) => {
      setEditingNodeData(currentData);
      setIsEditDialogOpen(true);
      setIsMenuOpen(false);
    },
    [setEditingNodeData, setIsEditDialogOpen, setIsMenuOpen],
  );

  const handleEditSubmit = useCallback(
    (values: EditNodeFormValues) => {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id !== id) {
            return node;
          }

          const updatedData: Partial<NodeData> = {
            ...node.data,
            label: values.label,
          };

          const nodeType = node.data.nodeType ?? editingNodeData?.nodeType;

          if (nodeType === "custom") {
            updatedData.prompt = values.prompt ?? "";
            updatedData.model =
              values.model ??
              (node.data as Partial<NodeData>).model ??
              DEFAULT_MODEL;
          }

          return {
            ...node,
            data: updatedData,
          };
        }),
      );

      closeEditDialog();
    },
    [closeEditDialog, editingNodeData, id, setNodes],
  );

  const handleEditDialogOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setIsEditDialogOpen(true);
        return;
      }

      closeEditDialog();
    },
    [closeEditDialog],
  );

  const handleDuplicate = useCallback(
    (currentData: NodeData) => {
      const currentNodes = getNodes();
      const currentNode = currentNodes.find((node) => node.id === id);

      if (currentNode) {
        const newNode: Node<NodeData> = {
          id: getId(),
          type: currentData.nodeType ?? "custom",
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
      const newNode: Node<NodeData> = {
        id: newNodeId,
        type: "custom",
        position: {
          x: currentNode.position.x + 200,
          y: currentNode.position.y,
        },
        data: createNodeData("custom"),
      };

      const newEdge: Edge = {
        id: `${id}-${newNodeId}`,
        source: id,
        target: newNodeId,
      };

      setNodes((nodes) => [...nodes, newNode]);
      setEdges((edges) => [...edges, newEdge]);
    }
    setIsMenuOpen(false);
  }, [getNodes, id, setEdges, setNodes]);

  return {
    isMenuOpen,
    setIsMenuOpen,
    handleDelete,
    handleEdit,
    handleDuplicate,
    handleAddConnection,
    editDialog: {
      open: isEditDialogOpen,
      nodeData: editingNodeData,
      onSubmit: handleEditSubmit,
      onOpenChange: handleEditDialogOpenChange,
    },
  };
};
