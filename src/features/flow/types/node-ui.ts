import type { CSSProperties, ComponentType } from "react";
import type { Position } from "@xyflow/react";
import type {
  FlowNodeType,
  NodeData,
  NodeId,
} from "@/features/flow/types/graph";

export interface NodeConfig {
  gradient: string;
  border: string;
  hoverBorder: string;
  iconColor: string;
  hoverBg: string;
  emojiGradient: string;
}

export interface NodeTypeConfig {
  emoji: string;
  job: string;
  label: string;
  showInResults?: boolean;
  skipDialog?: boolean;
}

export interface SidebarItemConfig {
  type: FlowNodeType;
  name: string;
  description: string;
  iconBg: string;
}

export interface ConnectionLimit {
  id: NodeId;
  max: number;
}

export interface ConnectionLimits {
  inputs?: ConnectionLimit[];
  outputs?: ConnectionLimit[];
}

export interface ConnectionState {
  current: number;
  max: number;
  isConnectable: boolean;
}

export type ConnectionStateMap = Record<NodeId, ConnectionState>;

export interface HandleDefinition {
  type: "source" | "target";
  position: Position;
  id: NodeId;
  size?: "large" | "small";
  style?: CSSProperties;
}

export interface NodeProps {
  data: NodeData;
  id: NodeId;
}

export interface MenuItem {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
}

export type MenuType = "basic" | "full";
