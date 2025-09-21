// 채팅 관련 공통 타입 정의

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

// 백엔드에서 사용하는 LangGraph 관련 타입들
export const LangNodeName = {
  routing: "routingNode",
  chat: "chatNode",
  google: "googleNode",
  blogSearch: "blogSearchNode",
  summary: "fetchSummaryNode",
  recommend: "recommendNode",
  end: "__end__",
} as const;

export const routeKeys = Object.keys(LangNodeName);

export type RouteType = keyof typeof LangNodeName | "";

// LangChain GraphState (백엔드용)
export interface GraphState {
  messages: unknown[]; // BaseMessage[] from @langchain/core/messages
}

// 백엔드와 공유하는 이벤트 타입
export interface ChatEventPayload {
  event?: string;
  name?: string;
  chunk?: { content?: string };
  message?: string;
}

// 세션 관련 타입
export interface SessionResponse {
  success: boolean;
  data?: { sessionId: string };
}

export interface SessionErrorResponse {
  error: string;
}

// 메시지 전송 요청 타입 (백엔드 send.ts와 호환)
export interface MessageRequest {
  message: string;
  type?: RouteType;
  postId?: string;
}

// 메시지 전송 응답 타입
export interface MessageResponse {
  success: boolean;
  requestId: string;
}
