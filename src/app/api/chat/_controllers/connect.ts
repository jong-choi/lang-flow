import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { checkpointer } from "@/app/api/chat/_controllers/graph/graph";
import type {
  SessionErrorResponse,
  SessionResponse,
} from "@/app/api/chat/_controllers/types/chat";
import { sessionStore } from "@/app/api/chat/_controllers/utils/session-store";

const SESSION_IDLE_TIMEOUT_MS = 1000 * 60 * 5; // 5분

export const resetIdleTimer = (id: string) => {
  try {
    sessionStore.setIdleTimer(id, SESSION_IDLE_TIMEOUT_MS, () => {
      checkpointer.deleteThread(id);
      sessionStore.delete(id);
    });
  } catch (error) {
    console.error("Reset idle timer error:", error); //디버깅
  }
};

export async function handleConnect() {
  try {
    const id = randomUUID();
    sessionStore.set({ id });
    sessionStore.setIdleTimer(id, SESSION_IDLE_TIMEOUT_MS, () => {
      checkpointer.deleteThread(id);
      sessionStore.delete(id);
    });

    const response: SessionResponse = {
      success: true,
      data: { sessionId: id },
    };
    return NextResponse.json(response);
  } catch (_error) {
    console.error("Session creation error:", _error); //디버깅
    const errorResponse: SessionErrorResponse = {
      error: "Failed to create session",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
