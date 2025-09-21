import type { FlowNodeType, NodeProps } from "@/features/flow/types/nodes";
import { ChatNode } from "./defined-nodes/chat-node";
import { CustomNode } from "./defined-nodes/custom-node";
import { InputNode } from "./defined-nodes/input-node";
import { MessageNode } from "./defined-nodes/message-node";
import { MultiInputMultiOutputNode } from "./defined-nodes/multi-input-multi-output-node";
import { MultiInputSingleOutputNode } from "./defined-nodes/multi-input-single-output-node";
import { OutputNode } from "./defined-nodes/output-node";
import { SearchNode } from "./defined-nodes/search-node";
import { SingleInputMultiOutputNode } from "./defined-nodes/single-input-multi-output-node";

export const nodeTypes: Record<FlowNodeType, React.FC<NodeProps>> = {
  inputNode: InputNode,
  outputNode: OutputNode,
  custom: CustomNode,
  chatNode: ChatNode,
  messageNode: MessageNode,
  searchNode: SearchNode,
  singleInputMultiOutput: SingleInputMultiOutputNode,
  multiInputSingleOutput: MultiInputSingleOutputNode,
  multiInputMultiOutput: MultiInputMultiOutputNode,
};
