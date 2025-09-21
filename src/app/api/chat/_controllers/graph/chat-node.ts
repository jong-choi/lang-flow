import { SystemMessage } from "@langchain/core/messages";
import { Command } from "@langchain/langgraph";
import type { SessionMessagesAnnotation } from "@/app/api/chat/_controllers/graph/graph";
import { LangNodeName } from "@/app/api/chat/_controllers/types/chat";
import {
  MAX_MESSAGES_LEN,
  llmModel,
} from "@/app/api/chat/_controllers/utils/model";

// 게시글 요약문을 기반으로 대화함
export async function chatNode(state: typeof SessionMessagesAnnotation.State) {
  const contextMessages = state.messages.slice(0 - MAX_MESSAGES_LEN);
  const systemPrompt = [
    new SystemMessage(
      `당신은 프론트엔드 기술블로그 Scribbly의 관리 챗봇입니다. 이 블로그의 주제는 React, Next.js, 자바스크립트, 타입스크립트, 알고리즘입니다. 현재 챗봇으로 기능은 대화하기, 사용자가 보고 있는 게시글 요약 확인하기, 구글 검색하기, 블로그 검색하기 입니다.`,
    ),
  ];

  // 최신 대화 n개 + 시스템 프롬프트
  try {
    const aiMessage = await llmModel.invoke([
      ...systemPrompt,
      ...contextMessages,
    ]);

    const nextState = {
      ...state,
      routeType: "end" as const,
      messages: [aiMessage],
    };

    return new Command({
      goto: LangNodeName.routing,
      update: nextState,
    });
  } catch (error) {
    console.error("LLM invocation error:", error); //디버깅
    throw error;
  }
}
