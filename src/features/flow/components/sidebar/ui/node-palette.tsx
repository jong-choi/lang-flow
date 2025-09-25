"use client";

/**
 * 사이드바에서 표시할 노드 팔레트.
 */
import { useCallback } from "react";
import type { DragEvent, FC } from "react";
import {
  SHARED_STYLES,
  nodeTypeConfigs,
  sidebarItems,
} from "@/features/flow/constants/node-config";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";
import type { FlowNodeType } from "@/features/flow/types/graph";
import type { SidebarItemConfig } from "@/features/flow/types/node-ui";

interface PaletteItemProps extends SidebarItemConfig {
  onDragStart: (event: DragEvent, nodeType: FlowNodeType) => void;
}

const PaletteItem: FC<PaletteItemProps> = ({
  type,
  name,
  description,
  iconBg,
  onDragStart,
}) => {
  const config = nodeTypeConfigs[type];

  return (
    <div
      className={SHARED_STYLES.sidebarItem}
      onDragStart={(event) => onDragStart(event, type)}
      draggable
    >
      <div className="flex items-center gap-3">
        <div className={`${SHARED_STYLES.sidebarIcon} ${iconBg}`}>
          {config.emoji}
        </div>
        <div className="flex-1">
          <div className="font-bold text-gray-800">{name}</div>
          <div className="text-sm font-medium text-violet-600">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SidebarNodePalette: FC = () => {
  const setType = useFlowGeneratorStore.use.setDraggingType();
  const nodeLoaded = useFlowGeneratorStore.use.canvasNodes((canvasNodes) =>
    canvasNodes.some((canvasNode) => Boolean(canvasNode)),
  );
  const hasInputNode = useFlowGeneratorStore.use.canvasNodes((canvasNodes) =>
    canvasNodes.some((canvasNode) => canvasNode.type === "inputNode"),
  );
  const hasOutputNode = useFlowGeneratorStore.use.canvasNodes((canvasNodes) =>
    canvasNodes.some((canvasNode) => canvasNode.type === "outputNode"),
  );

  const handleDragStart = useCallback(
    (event: DragEvent, nodeType: FlowNodeType) => {
      setType(nodeType);
      event.dataTransfer.effectAllowed = "move";
    },
    [setType],
  );

  const filteredSidebarItems = sidebarItems.filter((sidebarItem) => {
    if (sidebarItem.type === "inputNode") {
      return !hasInputNode;
    }
    if (sidebarItem.type === "outputNode") {
      return !hasOutputNode;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {nodeLoaded &&
        filteredSidebarItems.map((sidebarItem) => (
          <PaletteItem
            key={sidebarItem.type}
            {...sidebarItem}
            onDragStart={handleDragStart}
          />
        ))}
    </div>
  );
};
