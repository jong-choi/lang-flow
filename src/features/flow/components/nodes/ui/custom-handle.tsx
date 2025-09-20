"use client";

import { Handle } from "@xyflow/react";
import type { HandleDefinition } from "@/features/flow/types/nodes";

export const CustomHandle: React.FC<{
  definition: HandleDefinition;
  isConnectable: boolean;
}> = ({ definition, isConnectable }) => {
  const sizeClass =
    definition.size === "large" || definition.size === undefined
      ? "w-4 h-4"
      : "w-3 h-3";
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
