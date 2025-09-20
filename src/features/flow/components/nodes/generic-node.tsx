"use client";

/**
 * 각 노드 타입에서 공통으로 사용하는 컨테이너와 핸들
 */
import React from "react";
import { Copy, Edit, MoreVertical, Plus, Trash2 } from "lucide-react";
import { Handle, Position } from "@xyflow/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SHARED_STYLES,
  nodeConfigs,
} from "@/features/flow/constants/node-config";
import { useConnectionLimits } from "@/features/flow/hooks/use-connection-limits";
import { useNodeMenu } from "@/features/flow/hooks/use-node-menu";
import type {
  FlowNodeType,
  HandleDefinition,
  MenuItem,
  MenuType,
  NodeConfig,
  NodeData,
  NodeProps,
} from "@/features/flow/types/nodes";

const NodeContainer: React.FC<{
  config: NodeConfig;
  children: React.ReactNode;
  menuItems: MenuItem[];
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}> = ({ config, children, menuItems, isMenuOpen, setIsMenuOpen }) => (
  <div
    className={`${SHARED_STYLES.nodeContainer} ${config.gradient} ${config.border} ${config.hoverBorder}`}
  >
    {children}
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <button className={`${SHARED_STYLES.nodeButton} ${config.hoverBg}`}>
          <MoreVertical className={`h-4 w-4 ${config.iconColor}`} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {menuItems.map((item, index) => (
          <React.Fragment key={`${item.label}-${index}`}>
            {item.variant === "destructive" && index > 0 && (
              <DropdownMenuSeparator />
            )}
            <DropdownMenuItem onClick={item.onClick} variant={item.variant}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

const NodeContent: React.FC<{ data: NodeData; config: NodeConfig }> = ({
  data,
  config,
}) => (
  <div className={SHARED_STYLES.nodeContent}>
    <div className={`${SHARED_STYLES.emojiCircle} ${config.emojiGradient}`}>
      {data.emoji}
    </div>
    <div className={SHARED_STYLES.nodeInfo}>
      <div className={SHARED_STYLES.nodeTitle}>{data.label}</div>
      <div className={`${SHARED_STYLES.nodeJob} ${config.iconColor}`}>
        {data.job}
      </div>
    </div>
  </div>
);

const CustomHandle: React.FC<{
  definition: HandleDefinition;
  isConnectable: boolean;
}> = ({ definition, isConnectable }) => {
  const sizeClass =
    definition.size === "large" || definition.size === undefined
      ? "!w-4 !h-4"
      : "!w-3 !h-3";
  const colorClass =
    definition.type === "target" ? "!bg-violet-500" : "!bg-emerald-500";

  return (
    <Handle
      type={definition.type}
      position={definition.position}
      className={`${sizeClass} ${colorClass} !border-2 !border-white shadow-md`}
      id={definition.id}
      isConnectable={isConnectable}
      style={definition.style}
    />
  );
};

const createBasicMenuItems = (handleDelete: () => void): MenuItem[] => [
  {
    icon: Trash2,
    label: "삭제",
    onClick: handleDelete,
    variant: "destructive",
  },
];

const createFullMenuItems = (
  handleEdit: () => void,
  handleDuplicate: () => void,
  handleAddConnection: () => void,
  handleDelete: () => void,
): MenuItem[] => [
  { icon: Edit, label: "편집", onClick: handleEdit },
  { icon: Copy, label: "복제", onClick: handleDuplicate },
  { icon: Plus, label: "연결 추가", onClick: handleAddConnection },
  {
    icon: Trash2,
    label: "삭제",
    onClick: handleDelete,
    variant: "destructive",
  },
];

interface GenericNodeProps extends NodeProps {
  nodeType: FlowNodeType;
  menuType: MenuType;
  handles: HandleDefinition[];
}

const GenericNode: React.FC<GenericNodeProps> = ({
  data,
  id,
  nodeType,
  menuType,
  handles,
}) => {
  const menu = useNodeMenu(id);
  const config = nodeConfigs[nodeType];
  const connectionStates = useConnectionLimits(nodeType, id);

  const menuItems =
    menuType === "full"
      ? createFullMenuItems(
          () => menu.handleEdit(data),
          () => menu.handleDuplicate(data),
          menu.handleAddConnection,
          menu.handleDelete,
        )
      : createBasicMenuItems(menu.handleDelete);

  return (
    <NodeContainer
      config={config}
      menuItems={menuItems}
      isMenuOpen={menu.isMenuOpen}
      setIsMenuOpen={menu.setIsMenuOpen}
    >
      {handles.map((definition) => (
        <CustomHandle
          key={definition.id}
          definition={definition}
          isConnectable={connectionStates[definition.id]?.isConnectable ?? true}
        />
      ))}
      <NodeContent data={data} config={config} />
    </NodeContainer>
  );
};

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

export const CustomNode: React.FC<NodeProps> = ({ data, id }) => (
  <GenericNode
    data={data}
    id={id}
    nodeType="custom"
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

export const nodeTypes: Record<FlowNodeType, React.FC<NodeProps>> = {
  inputNode: InputNode,
  outputNode: OutputNode,
  custom: CustomNode,
  singleInputMultiOutput: SingleInputMultiOutputNode,
  multiInputSingleOutput: MultiInputSingleOutputNode,
  multiInputMultiOutput: MultiInputMultiOutputNode,
};
