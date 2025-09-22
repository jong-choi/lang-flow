import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { checkpointer } from "@/app/api/flow/_engine/graph-builder";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;

    // 세션 체크포인트 삭제
    await checkpointer.deleteThread(sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session deletion error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete session" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;

    const exists = true; // TODO : 세션스토어 존재 여부 파악하기

    return NextResponse.json({
      success: true,
      sessionId,
      exists,
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check session" },
      { status: 500 },
    );
  }
}
