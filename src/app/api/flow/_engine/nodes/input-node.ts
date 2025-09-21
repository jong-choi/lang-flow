import { HumanMessage } from "@langchain/core/messages";
import type { FlowStateAnnotation } from "@/app/api/flow/_engine/graph-builder";

export async function inputNode(
  state: typeof FlowStateAnnotation.State,
): Promise<Partial<typeof state>> {
  console.log("Executing input node with prompt:", state.prompt);

  return {
    messages: [new HumanMessage(state.prompt)],
    nodeOutputs: {
      ...state.nodeOutputs,
      input: { prompt: state.prompt, timestamp: new Date().toISOString() },
    },
  };
}
