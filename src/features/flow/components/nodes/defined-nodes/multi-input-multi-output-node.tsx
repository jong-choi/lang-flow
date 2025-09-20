"use client";

import { Position } from "@xyflow/react";
import { GenericNode } from "@/features/flow/components/nodes/generic-node";
import type { NodeProps } from "@/features/flow/types/nodes";

export const MultiInputMultiOutputNode: React.FC<NodeProps> = ({
  data,
  id,
}) => (
  <GenericNode
    data={data}
    id={id}
    nodeType="multiInputMultiOutput"
    menuType="basic"
    handles={[
      {
        type: "target",
        position: Position.Left,
        id: "input-1",
        size: "small",
        style: { top: "20%" },
      },
      {
        type: "target",
        position: Position.Left,
        id: "input-2",
        size: "small",
        style: { top: "40%" },
      },
      {
        type: "target",
        position: Position.Left,
        id: "input-3",
        size: "small",
        style: { top: "60%" },
      },
      {
        type: "target",
        position: Position.Left,
        id: "input-4",
        size: "small",
        style: { top: "80%" },
      },
      {
        type: "source",
        position: Position.Right,
        id: "output-1",
        size: "small",
        style: { top: "30%" },
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
        style: { top: "70%" },
      },
    ]}
  />
);
