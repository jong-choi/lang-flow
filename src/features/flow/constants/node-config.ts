/**
 * 플로우 기능에서 공통으로 쓰이는 스타일과 노드 설정을 모아둔 상수 파일.
 */
import type { FlowNodeType } from "@/features/flow/types/graph";
import type {
  ConnectionLimits,
  NodeConfig,
  NodeTypeConfig,
  SidebarItemConfig,
} from "@/features/flow/types/node-ui";

export const SHARED_STYLES = {
  nodeContainer:
    "px-6 py-4 shadow-lg rounded-xl bg-gradient-to-br border-2 transition-all duration-200 relative group backdrop-blur-sm",
  nodeButton:
    "absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200",
  nodeContent: "flex items-center",
  emojiCircle:
    "flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-xl shadow-inner",
  nodeInfo: "ml-3 flex-1",
  nodeTitle: "text-lg font-bold text-gray-800",
  nodeJob: "text-sm font-medium",
  sidebarItem:
    "p-4 bg-gradient-to-br from-white to-violet-50 border-2 border-violet-200 rounded-xl cursor-move hover:border-violet-300 hover:shadow-lg transition-all duration-200 group backdrop-blur-sm",
  sidebarIcon:
    "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-xl shadow-inner",
} as const;

export const nodeConfigs: Record<FlowNodeType, NodeConfig> = {
  inputNode: {
    gradient: "from-white to-violet-50",
    border: "border-violet-200",
    hoverBorder: "hover:border-violet-300",
    iconColor: "text-violet-600",
    hoverBg: "hover:bg-violet-100/50",
    emojiGradient: "from-violet-100 to-violet-200",
  },
  outputNode: {
    gradient: "from-white to-violet-50",
    border: "border-violet-200",
    hoverBorder: "hover:border-violet-300",
    iconColor: "text-violet-600",
    hoverBg: "hover:bg-violet-100/50",
    emojiGradient: "from-violet-100 to-violet-200",
  },
  chatNode: {
    gradient: "from-green-50 to-emerald-50",
    border: "border-green-300",
    hoverBorder: "hover:border-green-400",
    iconColor: "text-green-600",
    hoverBg: "hover:bg-green-100/50",
    emojiGradient: "from-green-100 to-green-200",
  },
  searchNode: {
    gradient: "from-yellow-50 to-amber-50",
    border: "border-yellow-300",
    hoverBorder: "hover:border-yellow-400",
    iconColor: "text-yellow-600",
    hoverBg: "hover:bg-yellow-100/50",
    emojiGradient: "from-yellow-100 to-yellow-200",
  },
  messageNode: {
    gradient: "from-slate-50 to-gray-50",
    border: "border-slate-300",
    hoverBorder: "hover:border-slate-400",
    iconColor: "text-slate-600",
    hoverBg: "hover:bg-slate-100/50",
    emojiGradient: "from-slate-100 to-slate-200",
  },
  singleInputMultiOutput: {
    gradient: "from-purple-50 to-pink-50",
    border: "border-purple-300",
    hoverBorder: "hover:border-purple-400",
    iconColor: "text-purple-600",
    hoverBg: "hover:bg-purple-100/50",
    emojiGradient: "from-purple-100 to-purple-200",
  },
  multiInputSingleOutput: {
    gradient: "from-blue-50 to-cyan-50",
    border: "border-blue-300",
    hoverBorder: "hover:border-blue-400",
    iconColor: "text-blue-600",
    hoverBg: "hover:bg-blue-100/50",
    emojiGradient: "from-blue-100 to-blue-200",
  },
};

export const nodeTypeConfigs: Record<FlowNodeType, NodeTypeConfig> = {
  inputNode: {
    emoji: "📥",
    job: "시작",
    label: "시작 노드",
    skipDialog: true,
  },
  outputNode: {
    emoji: "📤",
    job: "종료",
    label: "종료 노드",
    skipDialog: true,
  },
  chatNode: {
    emoji: "💬",
    job: "채팅",
    label: "채팅 노드",
  },
  searchNode: {
    emoji: "🔍",
    job: "검색",
    label: "검색 노드",
  },
  messageNode: {
    emoji: "💭",
    job: "프롬프트",
    label: "프롬프트 노드",
    showInResults: true,
  },
  singleInputMultiOutput: {
    emoji: "🔀",
    job: "분기",
    label: "분기 노드",
  },
  multiInputSingleOutput: {
    emoji: "🔄",
    job: "합성",
    label: "합성 노드",
    showInResults: true,
  },
};

export const connectionLimits: Record<FlowNodeType, ConnectionLimits> = {
  inputNode: {
    outputs: [{ id: "right", max: 1 }],
  },
  outputNode: {
    inputs: [{ id: "left", max: 1 }],
  },
  chatNode: {
    inputs: [{ id: "left", max: 1 }],
    outputs: [{ id: "right", max: 1 }],
  },
  searchNode: {
    inputs: [{ id: "left", max: 1 }],
    outputs: [{ id: "right", max: 1 }],
  },
  messageNode: {
    inputs: [{ id: "left", max: 1 }],
    outputs: [{ id: "right", max: 1 }],
  },
  singleInputMultiOutput: {
    inputs: [{ id: "input", max: 1 }],
    outputs: [
      { id: "output-1", max: 1 },
      { id: "output-2", max: 1 },
      { id: "output-3", max: 1 },
    ],
  },
  multiInputSingleOutput: {
    inputs: [
      { id: "input-1", max: 1 },
      { id: "input-2", max: 1 },
      { id: "input-3", max: 1 },
    ],
    outputs: [{ id: "output", max: 1 }],
  },
};

export const sidebarItems: SidebarItemConfig[] = [
  {
    type: "inputNode",
    name: "입력 노드",
    description: "시작점 (단일 출력)",
    iconBg: "from-blue-100 to-blue-200",
  },
  {
    type: "chatNode",
    name: "채팅 노드",
    description: "AI 채팅 (1:1)",
    iconBg: "from-green-100 to-green-200",
  },
  {
    type: "searchNode",
    name: "검색 노드",
    description: "구글 검색 (1:1)",
    iconBg: "from-yellow-100 to-yellow-200",
  },
  {
    type: "messageNode",
    name: "메시지 노드",
    description: "템플릿 메시지 (1:1)",
    iconBg: "from-slate-100 to-slate-200",
  },
  {
    type: "singleInputMultiOutput",
    name: "분기 노드",
    description: "1개 입력 → 3개 출력",
    iconBg: "from-purple-100 to-purple-200",
  },
  {
    type: "multiInputSingleOutput",
    name: "합성 노드",
    description: "3개 입력 → 1개 출력",
    iconBg: "from-blue-100 to-blue-200",
  },
  {
    type: "outputNode",
    name: "출력 노드",
    description: "결과 출력 (단일 입력)",
    iconBg: "from-red-100 to-red-200",
  },
];
