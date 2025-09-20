"use client";

import React from "react";
import { AlertCircle, RotateCw } from "lucide-react";
import { nodeConfigs } from "@/features/flow/constants/node-config";
import { useNodeActions } from "@/features/flow/context/node-actions-context";
import { useConnectionLimits } from "@/features/flow/hooks/use-connection-limits";
import { useNodeMenu } from "@/features/flow/hooks/use-node-menu";
import type {
  FlowNodeType,
  HandleDefinition,
  MenuType,
  NodeProps,
} from "@/features/flow/types/nodes";
import {
  createBasicMenuItems,
  createFullMenuItems,
} from "./menu/node-menu-items";
import { CustomHandle } from "./ui/custom-handle";
import { NodeContainer } from "./ui/node-container";
import { NodeContent } from "./ui/node-content";

interface GenericNodeProps extends NodeProps {
  nodeType: FlowNodeType;
  menuType: MenuType;
  handles: HandleDefinition[];
}

export const GenericNode: React.FC<GenericNodeProps> = ({
  data,
  id,
  nodeType,
  menuType,
  handles,
}) => {
  const { retryNode } = useNodeActions();
  const menu = useNodeMenu(id);
  const config = nodeConfigs[nodeType];
  const connectionStates = useConnectionLimits(nodeType, id);

  const menuItems =
    menuType === "full"
      ? createFullMenuItems(
          () => menu.handleEdit(data),
          () => menu.handleDuplicate(data),
          menu.handleAddConnection,
          menu.handleDelete,
        )
      : createBasicMenuItems(menu.handleDelete);

  return (
    <NodeContainer
      config={config}
      menuItems={menuItems}
      isMenuOpen={menu.isMenuOpen}
      setIsMenuOpen={menu.setIsMenuOpen}
    >
      {handles.map((definition) => (
        <CustomHandle
          key={definition.id}
          definition={definition}
          isConnectable={connectionStates[definition.id]?.isConnectable ?? true}
        />
      ))}
      <NodeContent data={data} config={config} />
      {data.runStatus === "failed" && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <button
            className="px-2 h-6 text-xs rounded-md bg-red-50 border border-red-200 text-red-700 hover:bg-red-100"
            onClick={() => retryNode(id)}
          >
            <span className="inline-flex items-center gap-1">
              <RotateCw className="h-3 w-3" /> 재시도
            </span>
          </button>
        </div>
      )}
    </NodeContainer>
  );
};
