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
import type {
  FlowNodeType,
  SidebarItemConfig,
} from "@/features/flow/types/nodes";

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
          <div className="text-sm text-violet-600 font-medium">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SidebarNodePalette: FC = () => {
  const setType = useFlowGeneratorStore.use.setDraggingType();

  const handleDragStart = useCallback(
    (event: DragEvent, nodeType: FlowNodeType) => {
      setType(nodeType);
      event.dataTransfer.effectAllowed = "move";
    },
    [setType],
  );

  return (
    <div className="space-y-4">
      {sidebarItems.map((item) => (
        <PaletteItem key={item.type} {...item} onDragStart={handleDragStart} />
      ))}
    </div>
  );
};
