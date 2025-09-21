/**
 * 플로우 빌더에서 재사용하는 타입 모음.
 */
import type { CSSProperties, ComponentType } from "react";
import type { Position } from "@xyflow/react";

export type FlowNodeType =
  | "inputNode"
  | "outputNode"
  | "custom"
  | "singleInputMultiOutput"
  | "multiInputSingleOutput"
  | "multiInputMultiOutput";

export interface NodeData {
  label: string;
  emoji: string;
  job: string;
  nodeType?: FlowNodeType;
  runStatus?: "idle" | "running" | "success" | "failed"; // 노드 실행 상태
  level?: number; // 실행 위치
  prompt?: string;
  model?: string;
  [key: string]: string | number | undefined;
}

export interface NodeProps {
  data: NodeData;
  id: string;
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
}

export interface ConnectionLimitEntry {
  id: string;
  max: number;
}

export interface ConnectionLimits {
  inputs?: ConnectionLimitEntry[];
  outputs?: ConnectionLimitEntry[];
}

export interface HandleDefinition {
  type: "source" | "target";
  position: Position;
  id: string;
  size?: "large" | "small";
  style?: CSSProperties;
}

export interface SidebarItemConfig {
  type: FlowNodeType;
  name: string;
  description: string;
  iconBg: string;
}

export type ConnectionStateMap = Record<
  string,
  { current: number; max: number; isConnectable: boolean }
>;
