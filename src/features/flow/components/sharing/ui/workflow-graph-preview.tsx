"use client";

import { type CSSProperties, useMemo } from "react";
import {
  Background,
  Controls,
  Handle,
  type NodeProps,
  type NodeTypes,
  Position,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { edgeTypes } from "@/features/flow/components/nodes/custom-edge";
import type { SchemaEdge, SchemaNode } from "@/features/flow/types/graph";

type PreviewHandleDefinition = {
  id: string;
  type: "source" | "target";
  position: Position;
  size?: "small" | "large";
  style?: CSSProperties;
};

const handleClassName = (
  type: "source" | "target",
  size?: "small" | "large",
) => {
  const sizeClass = size === "small" ? "h-2 w-2" : "h-3 w-3";
  const colorClass = type === "source" ? "bg-emerald-500" : "bg-violet-500";

  return `${sizeClass} ${colorClass} border-2 border-white shadow-sm`;
};

const createPreviewNode = (
  handles: PreviewHandleDefinition[],
): React.FC<NodeProps<SchemaNode>> => {
  const PreviewNodeComponent: React.FC<NodeProps<SchemaNode>> = ({ data }) => (
    <div className="relative flex h-10 w-16 items-center justify-center gap-3 rounded-lg border-2 border-slate-200 bg-white p-3 shadow-sm">
      {handles.map((handle) => (
        <Handle
          key={handle.id}
          id={handle.id}
          type={handle.type}
          position={handle.position}
          isConnectable={false}
          className={handleClassName(handle.type, handle.size)}
          style={handle.style}
        />
      ))}
      <div className="line-clamp-1 text-xs text-slate-500">
        {data?.job || "작업"}
      </div>
    </div>
  );

  PreviewNodeComponent.displayName = "PreviewNode";

  return PreviewNodeComponent;
};

const previewNodeTypes: NodeTypes = {
  inputNode: createPreviewNode([
    { type: "source", position: Position.Right, id: "right" },
  ]),
  outputNode: createPreviewNode([
    { type: "target", position: Position.Left, id: "left" },
  ]),
  chatNode: createPreviewNode([
    { type: "target", position: Position.Left, id: "left" },
    { type: "source", position: Position.Right, id: "right" },
  ]),
  searchNode: createPreviewNode([
    { type: "target", position: Position.Left, id: "left" },
    { type: "source", position: Position.Right, id: "right" },
  ]),
  messageNode: createPreviewNode([
    { type: "target", position: Position.Left, id: "left" },
    { type: "source", position: Position.Right, id: "right" },
  ]),
  singleInputMultiOutput: createPreviewNode([
    { type: "target", position: Position.Left, id: "input" },
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
  ]),
  multiInputSingleOutput: createPreviewNode([
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
    { type: "source", position: Position.Right, id: "output" },
  ]),
};

interface WorkflowGraphPreviewProps {
  nodes: SchemaNode[];
  edges: SchemaEdge[];
}

export function WorkflowGraphPreview({
  nodes,
  edges,
}: WorkflowGraphPreviewProps) {
  const memoizedNodes = useMemo(() => nodes, [nodes]);
  const memoizedEdges = useMemo(() => edges, [edges]);

  return (
    <div className="h-96 w-full rounded-lg border bg-slate-50">
      <ReactFlowProvider>
        <ReactFlow<SchemaNode, SchemaEdge>
          nodes={memoizedNodes}
          edges={memoizedEdges}
          nodeTypes={previewNodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{
            padding: 0.2,
            includeHiddenNodes: false,
          }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          className="workflow-graph-preview"
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
