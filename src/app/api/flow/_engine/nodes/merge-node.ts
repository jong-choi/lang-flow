import { AIMessage } from "@langchain/core/messages";
import type { FlowStateAnnotation } from "@/app/api/flow/_engine/graph-builder";

/**
 * 병합 노드 - 여러 분기의 결과를 하나로 합칩니다.
 * 연결된 입력 노드들의 출력값을 \n\n으로 구분하여 합칩니다.
 */
export async function mergeNode(
  state: typeof FlowStateAnnotation.State,
  nodeId: string,
  inputNodeIds: string[] = [],
): Promise<Partial<typeof state>> {
  console.log("=== Executing merge node ===");
  console.log("Node ID:", nodeId);
  console.log("Input node IDs:", inputNodeIds);
  console.log("Current state:", JSON.stringify(state, null, 2));

  try {
    // 연결된 입력 노드들이 없는 경우
    if (inputNodeIds.length === 0) {
      console.log("No input nodes connected to merge node");
      return {
        messages: [new AIMessage("병합할 입력 노드가 연결되지 않았습니다.")],
        nodeOutputs: {
          ...state.nodeOutputs,
          [nodeId]: {
            type: "merge",
            error: "No input nodes connected",
            timestamp: new Date().toISOString(),
          },
        },
      };
    }

    // 연결된 입력 노드들의 출력값을 수집
    const inputOutputs: string[] = [];
    const nodeOutputs = state.nodeOutputs || {};

    for (const inputNodeId of inputNodeIds) {
      const nodeOutput = nodeOutputs[inputNodeId];
      if (nodeOutput) {
        let outputContent = "";

        // 노드 타입에 따라 적절한 출력 내용 추출
        if (nodeOutput.type === "message" && nodeOutput.rendered) {
          outputContent = nodeOutput.rendered as string;
        } else if (nodeOutput.type === "ai" && nodeOutput.content) {
          outputContent = nodeOutput.content as string;
        } else if (nodeOutput.type === "input" && nodeOutput.content) {
          outputContent = nodeOutput.content as string;
        } else {
          // 기본적으로 JSON 문자열로 변환
          outputContent = JSON.stringify(nodeOutput);
        }

        if (outputContent && outputContent.trim().length > 0) {
          inputOutputs.push(outputContent.trim());
        }
      } else {
        console.warn(`No output found for input node: ${inputNodeId}`);
      }
    }

    let mergedContent: string;

    if (inputOutputs.length > 0) {
      // 분기 결과들을 \n\n으로 구분하여 병합
      mergedContent = inputOutputs.join("\n\n");
    } else {
      // fallback: 마지막 메시지의 내용을 사용
      const messages = state.messages;
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        mergedContent =
          typeof lastMessage.content === "string"
            ? lastMessage.content
            : "병합할 내용이 없습니다.";
      } else {
        mergedContent = "병합할 내용이 없습니다.";
      }
    }

    console.log("Merged content:", mergedContent);

    // 병합된 메시지 생성
    const mergedMessage = new AIMessage(mergedContent);

    const result = {
      messages: [...state.messages, mergedMessage],
      nodeOutputs: {
        ...state.nodeOutputs,
        [nodeId]: {
          type: "merge",
          mergedContent: mergedContent,
          inputNodeIds: inputNodeIds,
          inputOutputs: inputOutputs,
          sourceNodeCount: inputOutputs.length,
          timestamp: new Date().toISOString(),
        },
      },
    };

    console.log("=== Merge node result ===", JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error("Merge node error:", error);

    const errorMessage = new AIMessage(
      "죄송합니다. 병합 노드에서 오류가 발생했습니다.",
    );

    return {
      messages: [...state.messages, errorMessage],
      nodeOutputs: {
        ...state.nodeOutputs,
        [nodeId]: {
          type: "merge",
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      },
    };
  }
}
