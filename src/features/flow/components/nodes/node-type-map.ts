import type { FlowNodeType, NodeProps } from "@/features/flow/types/nodes";
import { CustomNode } from "./defined-nodes/custom-node";
import { InputNode } from "./defined-nodes/input-node";
import { MultiInputMultiOutputNode } from "./defined-nodes/multi-input-multi-output-node";
import { MultiInputSingleOutputNode } from "./defined-nodes/multi-input-single-output-node";
import { OutputNode } from "./defined-nodes/output-node";
import { SingleInputMultiOutputNode } from "./defined-nodes/single-input-multi-output-node";

export const nodeTypes: Record<FlowNodeType, React.FC<NodeProps>> = {
  inputNode: InputNode,
  outputNode: OutputNode,
  custom: CustomNode,
  singleInputMultiOutput: SingleInputMultiOutputNode,
  multiInputSingleOutput: MultiInputSingleOutputNode,
  multiInputMultiOutput: MultiInputMultiOutputNode,
};
