/**
 * Flow feature 전용 타입 모음.
 */
import type { CSSProperties, ComponentType } from "react";
import type { Position } from "@xyflow/react";
import type { BaseNodeData, NodeId } from "@/types/flow";

export type FlowNodeType =
  | "inputNode"
  | "outputNode"
  | "chatNode"
  | "searchNode"
  | "messageNode"
  | "singleInputMultiOutput"
  | "multiInputSingleOutput";

export interface NodeData extends BaseNodeData {
  nodeType?: FlowNodeType; // 오버라이딩
  runStatus?: "idle" | "running" | "success" | "failed";
  level?: number;
  showInResults?: boolean; // 결과창에 표시할지 여부
  [key: string]: string | number | boolean | undefined;
}

export interface NodeProps {
  data: NodeData;
  id: NodeId;
}

export interface NodeConfig {
  gradient: string;
  border: string;
  hoverBorder: string;
  iconColor: string;
  hoverBg: string;
  emojiGradient: string;
}

export type MenuVariant = "default" | "destructive";

export interface MenuItem {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  variant?: MenuVariant;
}

export type MenuType = "basic" | "full";

export interface NodeTypeConfig {
  emoji: string;
  job: string;
  label: string;
  showInResults?: boolean;
}

export interface SidebarItemConfig {
  type: FlowNodeType;
  name: string;
  description: string;
  iconBg: string;
}

export interface ConnectionLimitEntry {
  id: NodeId;
  max: number;
}

export interface ConnectionLimits {
  inputs?: ConnectionLimitEntry[];
  outputs?: ConnectionLimitEntry[];
}

interface ConnectionState {
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
