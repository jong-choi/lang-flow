import { ChatNode } from "@/features/flow/components/nodes/defined-nodes/chat-node";
import { InputNode } from "@/features/flow/components/nodes/defined-nodes/input-node";
import { MessageNode } from "@/features/flow/components/nodes/defined-nodes/message-node";
import { MultiInputSingleOutputNode } from "@/features/flow/components/nodes/defined-nodes/multi-input-single-output-node";
import { OutputNode } from "@/features/flow/components/nodes/defined-nodes/output-node";
import { SearchNode } from "@/features/flow/components/nodes/defined-nodes/search-node";
import { SingleInputMultiOutputNode } from "@/features/flow/components/nodes/defined-nodes/single-input-multi-output-node";
import type { FlowNodeType, NodeProps } from "@/features/flow/types/nodes";

export const nodeTypes: Record<FlowNodeType, React.FC<NodeProps>> = {
  inputNode: InputNode,
  outputNode: OutputNode,
  chatNode: ChatNode,
  messageNode: MessageNode,
  searchNode: SearchNode,
  singleInputMultiOutput: SingleInputMultiOutputNode,
  multiInputSingleOutput: MultiInputSingleOutputNode,
};
