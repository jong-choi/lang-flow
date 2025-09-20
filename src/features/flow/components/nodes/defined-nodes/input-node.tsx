"use client";

import { Position } from "@xyflow/react";
import { GenericNode } from "@/features/flow/components/nodes/generic-node";
import type { NodeProps } from "@/features/flow/types/nodes";

export const InputNode: React.FC<NodeProps> = ({ data, id }) => (
  <GenericNode
    data={data}
    id={id}
    nodeType="inputNode"
    menuType="basic"
    handles={[
      {
        type: "source",
        position: Position.Right,
        id: "right",
      },
    ]}
  />
);
