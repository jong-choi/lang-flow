"use client";

import { Handle } from "@xyflow/react";
import type { HandleDefinition } from "@/features/flow/types/nodes";

export const CustomHandle: React.FC<{
  definition: HandleDefinition;
  isConnectable: boolean;
}> = ({ definition, isConnectable }) => {
  const sizeMap = {
    large: "w-4 h-4",
    small: "w-3 h-3",
  } as const;
  type SizeKey = keyof typeof sizeMap;
  const sizeKey: SizeKey = definition.size === "small" ? "small" : "large";
  const sizeClass = sizeMap[sizeKey];
  const colorClass =
    definition.type === "target" ? "bg-violet-500" : "bg-emerald-500";

  return (
    <Handle
      type={definition.type}
      position={definition.position}
      className={`${sizeClass} ${colorClass} border-2 border-white shadow-md`}
      id={definition.id}
      isConnectable={isConnectable}
      style={definition.style}
    />
  );
};
