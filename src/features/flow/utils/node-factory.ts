/**
 * 노드 생성과 관련된 헬퍼 함수 모음.
 */
import { nodeTypeConfigs } from "@/features/flow/constants/node-config";
import type { FlowNodeType, NodeData } from "@/features/flow/types/nodes";

let sequence = 0;

export const getId = () => `dndnode_${sequence++}`;

export const createNodeData = (type: FlowNodeType): NodeData => {
  const config = nodeTypeConfigs[type];

  const baseData: NodeData = {
    label: config.label,
    emoji: config.emoji,
    job: config.job,
    nodeType: type,
    runStatus: "idle",
    level: undefined,
  };

  if (type === "custom") {
    return {
      ...baseData,
      prompt: "",
      model: "gemma-1b-it",
    };
  }

  return baseData;
};
