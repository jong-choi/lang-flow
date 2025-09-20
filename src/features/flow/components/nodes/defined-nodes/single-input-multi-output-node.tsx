"use client";

import { Position } from "@xyflow/react";
import { GenericNode } from "@/features/flow/components/nodes/generic-node";
import type { NodeProps } from "@/features/flow/types/nodes";

export const SingleInputMultiOutputNode: React.FC<NodeProps> = ({
  data,
  id,
}) => (
  <GenericNode
    data={data}
    id={id}
    nodeType="singleInputMultiOutput"
    menuType="basic"
    handles={[
      {
        type: "target",
        position: Position.Left,
        id: "input",
      },
      {
        type: "source",
        position: Position.Right,
        id: "output-1",
        size: "small",
        style: { top: "25%" },
      },
      {
        type: "source",
        position: Position.Right,
        id: "output-2",
        size: "small",
        style: { top: "50%" },
      },
      {
        type: "source",
        position: Position.Right,
        id: "output-3",
        size: "small",
        style: { top: "75%" },
      },
    ]}
  />
);
