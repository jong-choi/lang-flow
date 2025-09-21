import { HumanMessage } from "@langchain/core/messages";
import type { FlowStateAnnotation } from "../graph-builder";

/**
 * 메시지 노드 - 템플릿을 사용하여 정적 메시지를 생성합니다.
 * {input} 파라미터를 마지막 메시지의 내용으로 치환합니다.
 */
export async function messageNode(
  state: typeof FlowStateAnnotation.State,
  nodeId: string,
  template?: string,
): Promise<Partial<typeof state>> {
  const resolvedTemplate = template || "기본 메시지: {input}";
  console.log("=== Executing message node ===");
  console.log("Node ID:", nodeId);
  console.log("Template:", resolvedTemplate);
  console.log("Current state:", JSON.stringify(state, null, 2));

  try {
    // 마지막 메시지의 내용을 가져오기
    const lastMessageContent =
      state.messages.length > 0
        ? (state.messages[state.messages.length - 1].content as string)
        : state.prompt || "";

    console.log("Last message content:", lastMessageContent);

    // {input} 템플릿을 실제 값으로 치환
    const renderedMessage = resolvedTemplate.replace(
      /{input}/g,
      lastMessageContent,
    );

    console.log("Rendered message:", renderedMessage);

    // HumanMessage로 변환
    const messageToAdd = new HumanMessage(renderedMessage);

    const result = {
      messages: [...state.messages, messageToAdd],
      nodeOutputs: {
        ...state.nodeOutputs,
        [nodeId]: {
          type: "message",
          template: resolvedTemplate,
          rendered: renderedMessage,
          input: lastMessageContent,
          timestamp: new Date().toISOString(),
        },
      },
    };

    console.log("=== Message node result ===", JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error("Message node error:", error);

    const errorMessage = new HumanMessage(
      "죄송합니다. 메시지 노드에서 오류가 발생했습니다.",
    );

    return {
      messages: [...state.messages, errorMessage],
      nodeOutputs: {
        ...state.nodeOutputs,
        [nodeId]: {
          type: "message",
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      },
    };
  }
}
