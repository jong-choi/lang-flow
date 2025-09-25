"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Position, useReactFlow } from "@xyflow/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GenericNode } from "@/features/flow/components/nodes/generic-node";
import {
  CHAT_MODELS,
  DEFAULT_CHAT_MODEL,
} from "@/features/flow/constants/chat-models";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";
import type {
  NodeData,
  SchemaEdge,
  SchemaNode,
} from "@/features/flow/types/graph";
import type { NodeProps } from "@/features/flow/types/node-ui";

export const ChatNode: React.FC<NodeProps> = ({ data, id }) => {
  const { setNodes } = useReactFlow<SchemaNode, SchemaEdge>();
  const updateNodeDialogData = useFlowGeneratorStore.use.updateNodeDialogData();
  const nodeDialog = useFlowGeneratorStore.use.nodeDialog();

  const isCurrentNodeDialogTarget =
    nodeDialog.isOpen && nodeDialog.targetNodeId === id;

  const selectedModel = useMemo(() => {
    return typeof data.model === "string" && data.model.length > 0
      ? data.model
      : DEFAULT_CHAT_MODEL;
  }, [data.model]);

  const updateNodeModel = useCallback(
    (nextModel: string) => {
      let updatedData: NodeData | null = null;

      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id !== id) {
            return node;
          }

          const nextData: NodeData = {
            ...node.data,
            model: nextModel,
          };

          updatedData = nextData;

          return {
            ...node,
            data: nextData,
          };
        }),
      );

      if (updatedData && isCurrentNodeDialogTarget) {
        updateNodeDialogData(updatedData);
      }
    },
    [id, isCurrentNodeDialogTarget, setNodes, updateNodeDialogData],
  );

  useEffect(() => {
    if (typeof data.model !== "string" || data.model.length === 0) {
      updateNodeModel(DEFAULT_CHAT_MODEL);
    }
  }, [data.model, updateNodeModel]);

  return (
    <GenericNode
      data={data}
      id={id}
      nodeType="chatNode"
      menuType="full"
      handles={[
        {
          type: "target",
          position: Position.Left,
          id: "left",
        },
        {
          type: "source",
          position: Position.Right,
          id: "right",
        },
      ]}
      extraContent={
        <div className="mt-4 w-full space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            사용 모델
          </div>
          <Select value={selectedModel} onValueChange={updateNodeModel}>
            <SelectTrigger className="w-full justify-between">
              <SelectValue placeholder="모델 선택" />
            </SelectTrigger>
            <SelectContent>
              {CHAT_MODELS.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    />
  );
};
