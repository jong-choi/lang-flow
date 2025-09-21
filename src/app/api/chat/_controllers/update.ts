import type { NextRequest } from "next/server";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { buildGraph } from "@/app/api/chat/_controllers/graph/graph";
import type { ChatMessage } from "@/app/api/chat/_controllers/types/chat";

interface UpdateRequest {
  messages: ChatMessage[];
}

export async function handleUpdate(request: NextRequest, sessionId: string) {
  try {
    const body: UpdateRequest = await request.json();
    const app = buildGraph();

    // 프론트엔드 ChatMessage를 LangChain Message로 변환
    const langChainMessages = body.messages.map((message) => {
      if (message.role === "user") {
        return new HumanMessage(message.content);
      } else if (message.role === "assistant") {
        return new AIMessage(message.content);
      } else if (message.role === "system") {
        return new SystemMessage(message.content);
      } else {
        return new HumanMessage(message.content);
      }
    });

    await app.updateState(
      { configurable: { thread_id: sessionId } },
      { messages: langChainMessages, routeType: "" as const },
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Update state error:", error); //디버깅
    return new Response(JSON.stringify({ error: "Failed to update state" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
