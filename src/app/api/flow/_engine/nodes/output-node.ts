import type { FlowStateAnnotation } from "@/app/api/flow/_engine/graph-builder";

export async function outputNode(
  state: typeof FlowStateAnnotation.State,
): Promise<Partial<typeof state>> {
  console.log("Executing output node");

  // 최종 결과를 정리
  const finalResult = {
    messages: state.messages,
    searchResults: state.searchResults,
    nodeOutputs: state.nodeOutputs,
    timestamp: new Date().toISOString(),
  };

  return {
    finalResult,
    nodeOutputs: {
      ...state.nodeOutputs,
      output: {
        finalResult,
        timestamp: new Date().toISOString(),
      },
    },
  };
}
