"use client";

import { Position } from "@xyflow/react";
import { GenericNode } from "@/features/flow/components/nodes/generic-node";
import type { NodeProps } from "@/features/flow/types/node-ui";

export const OutputNode: React.FC<NodeProps> = ({ data, id }) => (
  <GenericNode
    data={data}
    id={id}
    nodeType="outputNode"
    menuType="basic"
    handles={[
      {
        type: "target",
        position: Position.Left,
        id: "left",
      },
    ]}
  />
);
