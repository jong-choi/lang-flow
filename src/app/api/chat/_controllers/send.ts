import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { HumanMessage } from "@langchain/core/messages";
import { checkRateLimit } from "@/app/api/chat/_controllers/utils/rate-limit";
import { sessionStore } from "@/app/api/chat/_controllers/utils/session-store";
import type { MessageRequest, MessageResponse } from "@/types/chat";
import { createClient } from "@/utils/supabase/server";
import { resetIdleTimer } from "./connect";

export async function handleSend(request: NextRequest, sessionId: string) {
  try {
    const body = (await request.json()) as MessageRequest;

    if (!body) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 },
      );
    }

    // 인증 상태 확인
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const rateLimitResult = checkRateLimit(sessionId);

    if (!user && !rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "비회원 사용량을 초과하였습니다.",
        },
        { status: 429 },
      );
    }
    const d = 0.5 + Math.floor(Math.random() * 3);
    const routeType = body.type || "";
    sessionStore.set({
      id: sessionId,
      state: {
        messages: [new HumanMessage(body.message)],
        routeType,
        postId: body.postId,
      },
      count: rateLimitResult.currentCount + d,
    });
    resetIdleTimer(sessionId);

    const response: MessageResponse = {
      success: true,
      requestId: randomUUID(),
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Send message error:", error); //디버깅
    return NextResponse.json({ error }, { status: 500 });
  }
}
