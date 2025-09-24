/**
 * 노드 생성과 관련된 헬퍼 함수 모음.
 */
import { generateSlug } from "random-word-slugs";
import { DEFAULT_CHAT_MODEL } from "@/features/flow/constants/chat-models";
import { nodeTypeConfigs } from "@/features/flow/constants/node-config";
import type { FlowNodeType, NodeData } from "@/features/flow/types/nodes";

export const getId = () => {
  const randomName = generateSlug(2, {
    format: "kebab",
    partsOfSpeech: ["adjective", "noun"],
  }).replace(/-/g, "_"); // 'sleepy-fox' -> 'sleepy_fox'

  return `dndnode_${randomName}`; // ex: dndnode_sleepy_fox
};

export const createNodeData = (type: FlowNodeType): NodeData => {
  const config = nodeTypeConfigs[type];

  const baseData: NodeData = {
    label: config.label,
    emoji: config.emoji,
    job: config.job,
    nodeType: type,
    runStatus: "idle",
    level: undefined,
    showInResults: config.showInResults,
  };

  if (type === "chatNode") {
    return {
      ...baseData,
      model: DEFAULT_CHAT_MODEL,
    } satisfies NodeData;
  }

  return baseData;
};
