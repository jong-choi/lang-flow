"use client";

import type { DragEvent } from "react";
import {
  Background,
  type Connection,
  Controls,
  MiniMap,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  type IsValidConnection,
  ReactFlow,
} from "@xyflow/react";
import { edgeTypes } from "@/features/flow/components/nodes/custom-edge";
import { nodeTypes } from "@/features/flow/components/nodes/node-type-map";
import { TemplateGroupsOverlay } from "@/features/flow/components/section/flow/ui/template-groups-overlay";
import type { SchemaEdge, SchemaNode } from "@/features/flow/types/nodes";
import type { TemplateGroup } from "@/features/flow/utils/canvas";

export interface FlowGraphViewProps {
  nodes: SchemaNode[];
  edges: SchemaEdge[];
  onNodesChange: OnNodesChange<SchemaNode>;
  onEdgesChange: OnEdgesChange<SchemaEdge>;
  onConnect: OnConnect;
  isValidConnection: IsValidConnection<SchemaEdge>;
  onDrop: (event: DragEvent) => void;
  onDragOver: (event: DragEvent) => void;
  onReconnect: (oldEdge: SchemaEdge, connection: Connection) => void;
  onReconnectStart: () => void;
  onReconnectEnd: (event: MouseEvent | TouchEvent, edge: SchemaEdge) => void;
  templateGroups: TemplateGroup[];
}

export const FlowGraphView = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  isValidConnection,
  onDrop,
  onDragOver,
  onReconnect,
  onReconnectStart,
  onReconnectEnd,
  templateGroups,
}: FlowGraphViewProps) => {
  return (
    <>
      <ReactFlow<SchemaNode, SchemaEdge>
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onReconnect={onReconnect}
        onReconnectStart={onReconnectStart}
        onReconnectEnd={onReconnectEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        tabIndex={0}
        className="bg-gradient-to-br from-slate-50 to-violet-50"
        defaultEdgeOptions={{
          type: "custom",
          deletable: true,
        }}
      >
        <Controls />
        <MiniMap />
        <Background />
      </ReactFlow>
      <TemplateGroupsOverlay groups={templateGroups} />
    </>
  );
};
