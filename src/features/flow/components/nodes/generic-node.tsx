"use client";

import React from "react";
import { AlertCircle, RotateCw } from "lucide-react";
import {
  createBasicMenuItems,
  createFullMenuItems,
} from "@/features/flow/components/nodes/menu/node-menu-items";
import { CustomHandle } from "@/features/flow/components/nodes/ui/custom-handle";
import { EditDialog } from "@/features/flow/components/nodes/ui/edit-dialog";
import { NodeContainer } from "@/features/flow/components/nodes/ui/node-container";
import { NodeContent } from "@/features/flow/components/nodes/ui/node-content";
import { nodeConfigs } from "@/features/flow/constants/node-config";
import { useConnectionLimits } from "@/features/flow/hooks/use-connection-limits";
import { useNodeMenu } from "@/features/flow/hooks/use-node-menu";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";
import type {
  FlowNodeType,
  HandleDefinition,
  MenuType,
  NodeProps,
} from "@/features/flow/types/nodes";
import { RUN_STATUS } from "@/features/flow/utils/run-status";

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
  const requestNodeRetry = useFlowGeneratorStore.use.requestNodeRetry();
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
    <>
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
            isConnectable={
              connectionStates[definition.id]?.isConnectable ?? true
            }
          />
        ))}
        <NodeContent data={data} config={config} />
        {data.runStatus === RUN_STATUS.FAILED && (
          <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <button
              className="h-6 rounded-md border border-red-200 bg-red-50 px-2 text-xs text-red-700 hover:bg-red-100"
              onClick={() => requestNodeRetry(id)}
            >
              <span className="inline-flex items-center gap-1">
                <RotateCw className="h-3 w-3" /> 재시도
              </span>
            </button>
          </div>
        )}
      </NodeContainer>
      <EditDialog
        open={menu.editDialog.open}
        nodeData={menu.editDialog.nodeData}
        onOpenChange={menu.editDialog.onOpenChange}
        onSubmit={menu.editDialog.onSubmit}
      />
    </>
  );
};
