"use client";

/**
 * 플로우 생성 페이지의 메인 캔버스 로직을 담당하는 컴포넌트.
 * React Flow 상태 관리와 드래그 앤 드롭 흐름을 관리
 */
import { useCallback, useRef } from "react";
import {
  Background,
  type Connection,
  Controls,
  type Edge,
  type IsValidConnection,
  MiniMap,
  type Node,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  reconnectEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { edgeTypes } from "@/features/flow/components/nodes/custom-edge";
import { nodeTypes } from "@/features/flow/components/nodes/generic-node";
import { Sidebar } from "@/features/flow/components/sidebar";
import { SidebarNodePalette } from "@/features/flow/components/sidebar-node-palette";
import { DnDProvider, useDnD } from "@/features/flow/context/dnd-context";
import type { NodeData } from "@/features/flow/types/nodes";
import { createNodeData, getId } from "@/features/flow/utils/node-factory";

const initialNodes: Node<NodeData>[] = [
  {
    id: "1",
    type: "inputNode",
    data: createNodeData("inputNode"),
    position: { x: 250, y: 25 },
  },
];

// 드래그 앤 드롭 기반 플로우 빌더의 주요 렌더링과 상태 변환을 담당.
const DnDFlow = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const edgeReconnectSuccessful = useRef(true);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>(
    initialNodes as Node<NodeData>[],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();

  // 엣지 연결 시 유효한 조합인지 검사.
  const isValidConnection = useCallback<IsValidConnection<Edge>>(
    (item) => {
      const source = item.source;
      const target = item.target;

      if (!source || !target) return false;

      const sourceHandle = item.sourceHandle ?? null;
      const targetHandle = item.targetHandle ?? null;

      if (source === target && sourceHandle === targetHandle && sourceHandle)
        return false;

      const sourceNode = nodes.find((node) => node.id === source);
      const targetNode = nodes.find((node) => node.id === target);

      if (!sourceNode || !targetNode) return false;

      if (sourceNode.type === "inputNode" && targetNode.type === "inputNode")
        return false;

      if (sourceNode.type === "outputNode") return false;

      return true;
    },
    [nodes],
  );

  // 새 엣지를 생성하고 상태에 추가.
  const onConnect = useCallback(
    (params: Connection) => {
      if (isValidConnection(params)) {
        setEdges((eds) => addEdge(params, eds));
      }
    },
    [setEdges, isValidConnection],
  );

  // 엣지 재연결 시작 시 성공 여부 플래그 초기화.
  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  // 기존 엣지를 새로운 연결로 갱신.
  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeReconnectSuccessful.current = true;
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els as Edge[]));
    },
    [setEdges],
  );

  // 재연결 실패 시 엣지를 정리하고 상태 복구.
  const onReconnectEnd = useCallback(
    (_: MouseEvent | TouchEvent, edge: Edge) => {
      if (!edgeReconnectSuccessful.current) {
        setEdges((eds) =>
          (eds as Edge[]).filter((candidate) => candidate.id !== edge.id),
        );
      }
      edgeReconnectSuccessful.current = true;
    },
    [setEdges],
  );

  // 캔버스 위 드래그 시 브라우저 기본 동작을 막고 이동 형태로 표시.
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // 팔레트에서 끌어온 노드를 캔버스 좌표에 배치.
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<NodeData> = {
        id: getId(),
        type,
        position,
        data: createNodeData(type),
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, type, setNodes],
  );

  // Delete/Backspace 입력 시 선택된 노드와 엣지를 삭제.
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        const selectedNodes = nodes.filter((node) => node.selected);
        const selectedEdges = edges.filter((edge) => edge.selected);

        if (selectedNodes.length > 0) {
          setNodes((nds) => nds.filter((node) => !node.selected));
        }

        if (selectedEdges.length > 0) {
          setEdges((eds) => eds.filter((edge) => !edge.selected));
        }
      }
    },
    [nodes, edges, setEdges, setNodes],
  );

  return (
    <div className="flex h-screen">
      <Sidebar>
        <SidebarNodePalette />
      </Sidebar>
      <div className="flex-1" ref={reactFlowWrapper}>
        <ReactFlow<Node<NodeData>, Edge>
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
          onKeyDown={onKeyDown}
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
      </div>
    </div>
  );
};

// React Flow 컨텍스트로 감싼 전체 플로우 빌더 컴포넌트.
export const FlowBuilder = () => (
  <div className="h-screen">
    <ReactFlowProvider>
      <DnDProvider>
        <DnDFlow />
      </DnDProvider>
    </ReactFlowProvider>
  </div>
);
