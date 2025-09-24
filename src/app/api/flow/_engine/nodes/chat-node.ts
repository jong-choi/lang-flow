import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { ChatGoogle } from "@langchain/google-gauth";
import {
  CHAT_MODEL_VALUES,
  DEFAULT_CHAT_MODEL,
} from "@/features/flow/constants/chat-models";
import type { FlowStateAnnotation } from "@/app/api/flow/_engine/graph-builder";

const GOOGLE_API_KEY = process.env.GOOGLE_AI_API_KEY;

const MAX_OUTPUT_TOKENS = 2048;

const isSupportedModel = (model?: string): model is string =>
  typeof model === "string" && CHAT_MODEL_VALUES.includes(model);

const createChatModel = (model: string) =>
  new ChatGoogle({
    model,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    apiKey: GOOGLE_API_KEY,
  });

interface ChatNodeOptions {
  nodeId: string;
  model?: string;
}

export async function chatNode(
  state: typeof FlowStateAnnotation.State,
  { nodeId, model }: ChatNodeOptions,
): Promise<Partial<typeof state>> {
  const resolvedModel = isSupportedModel(model) ? model : DEFAULT_CHAT_MODEL;
  const llmModel = createChatModel(resolvedModel);

  console.log("=== Executing chat node ===");
  console.log(
    `Node ID: ${nodeId}, Model: ${resolvedModel}, Input state:`,
    JSON.stringify(state, null, 2),
  );

  try {
    let inputMessages = state.messages;
    // TODO : 사용자 입력값 없는 경우에 대해 디버깅
    if (!inputMessages || inputMessages.length === 0) {
      console.log("No input messages, using prompt:", state.prompt);
      inputMessages = [new HumanMessage(state.prompt || "안녕하세요!")];
    }

    // TODO : 시스폼 프롬프트 엔지니어링 필요
    const systemPrompt = new SystemMessage(
      `당신은 워크플로우 관리 시스템의 AI 어시스턴트입니다. 사용자의 질문에 친절하고 도움이 되는 답변을 제공해주세요.`,
    );

    const messages = [systemPrompt, ...inputMessages];
    console.log("Messages to send:", messages);

    const aiMessage = await llmModel.invoke(messages);

    console.log("AI Response:", aiMessage);
    console.log("Response content:", aiMessage.content);

    const result = {
      messages: [...inputMessages, aiMessage],
      nodeOutputs: {
        ...state.nodeOutputs,
        chat: {
          response: aiMessage.content,
          model: resolvedModel,
          nodeId,
          timestamp: new Date().toISOString(),
        },
      },
    };

    console.log("=== Chat node result ===", JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error(
      `Chat node error (nodeId: ${nodeId}, model: ${resolvedModel}):`,
      error,
    );

    const errorMessage = new AIMessage(
      "죄송합니다. 채팅 응답을 생성하는 중 오류가 발생했습니다.",
    );

    return {
      messages: [errorMessage],
      nodeOutputs: {
        ...state.nodeOutputs,
        chat: {
          error: error instanceof Error ? error.message : "Unknown error",
          model: resolvedModel,
          nodeId,
          timestamp: new Date().toISOString(),
        },
      },
    };
  }
}
