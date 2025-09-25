import { Position } from "@xyflow/react";
import { GenericNode } from "@/features/flow/components/nodes/generic-node";
import type { NodeProps } from "@/features/flow/types/node-ui";

export const MessageNode: React.FC<NodeProps> = ({ data, id }) => (
  <GenericNode
    data={data}
    id={id}
    nodeType="messageNode"
    menuType="full"
    handles={[
      {
        type: "target",
        position: Position.Left,
        id: "left",
      },
      {
        type: "source",
        position: Position.Right,
        id: "right",
      },
    ]}
  />
);
