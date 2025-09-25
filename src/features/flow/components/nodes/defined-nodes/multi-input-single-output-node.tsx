"use client";

import { Position } from "@xyflow/react";
import { GenericNode } from "@/features/flow/components/nodes/generic-node";
import type { NodeProps } from "@/features/flow/types/node-ui";

export const MultiInputSingleOutputNode: React.FC<NodeProps> = ({
  data,
  id,
}) => (
  <GenericNode
    data={data}
    id={id}
    nodeType="multiInputSingleOutput"
    menuType="basic"
    handles={[
      {
        type: "target",
        position: Position.Left,
        id: "input-1",
        size: "small",
        style: { top: "25%" },
      },
      {
        type: "target",
        position: Position.Left,
        id: "input-2",
        size: "small",
        style: { top: "50%" },
      },
      {
        type: "target",
        position: Position.Left,
        id: "input-3",
        size: "small",
        style: { top: "75%" },
      },
      {
        type: "source",
        position: Position.Right,
        id: "output",
      },
    ]}
  />
);
