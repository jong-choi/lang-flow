"use client";

import type { CSSProperties } from "react";
import { useStore as useReactFlowStore } from "@xyflow/react";
import type { TemplateGroup } from "@/features/flow/utils/canvas";

const DEFAULT_NODE_WIDTH = 220;
const DEFAULT_NODE_HEIGHT = 140;
const GROUP_PADDING = 24;

export const TemplateGroupsOverlay = ({
  groups,
}: {
  groups: TemplateGroup[];
}) => {
  const { transform, nodeInternals } = useReactFlowStore((state) => ({
    transform: state.transform,
    nodeInternals: state.nodeLookup,
  }));

  if (groups.length === 0) {
    return null;
  }

  const [translateX, translateY, zoom] = transform;

  return (
    <div className="pointer-events-none absolute inset-0">
      {groups.map((group) => {
        const nodes = group.nodeIds
          .map((id) => nodeInternals.get(id))
          .filter((node): node is NonNullable<typeof node> => Boolean(node));

        if (nodes.length === 0) {
          return null;
        }

        const minX = Math.min(
          ...nodes.map((node) => node.internals.positionAbsolute?.x ?? 0),
        );
        const minY = Math.min(
          ...nodes.map((node) => node.internals.positionAbsolute?.y ?? 0),
        );
        const maxX = Math.max(
          ...nodes.map(
            (node) =>
              (node.internals.positionAbsolute?.x ?? 0) +
              (node.width ?? DEFAULT_NODE_WIDTH),
          ),
        );
        const maxY = Math.max(
          ...nodes.map(
            (node) =>
              (node.internals.positionAbsolute?.y ?? 0) +
              (node.height ?? DEFAULT_NODE_HEIGHT),
          ),
        );

        const width = (maxX - minX) * zoom + GROUP_PADDING * 2;
        const height = (maxY - minY) * zoom + GROUP_PADDING * 2;
        const left = minX * zoom + translateX - GROUP_PADDING;
        const top = minY * zoom + translateY - GROUP_PADDING;

        const style: CSSProperties = {
          position: "absolute",
          left,
          top,
          width: Math.max(width, GROUP_PADDING * 2 + 40),
          height: Math.max(height, GROUP_PADDING * 2 + 40),
        };

        return (
          <div
            key={group.id}
            style={style}
            className="rounded-xl border-2 border-violet-200/80 bg-violet-50/40 shadow-sm"
          >
            <div className="absolute -top-3 left-4 inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-violet-600 shadow">
              {group.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
