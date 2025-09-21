import { type NextRequest, NextResponse } from "next/server";
import { checkpointer } from "@/app/api/chat/_controllers/graph/graph";
import { sessionStore } from "@/app/api/chat/_controllers/utils/session-store";

export async function handleDelete(_request: NextRequest, sessionId: string) {
  try {
    sessionStore.delete(sessionId);
    checkpointer.deleteThread(sessionId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete session error:", error); //디버깅
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 },
    );
  }
}
