import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface FlowSnapshot {
  nodes: unknown[];
  edges: unknown[];
}

// POST /api/send - 현재 플로우 스냅샷을 전달받아 로깅
export async function POST(request: Request) {
  try {
    const body = (await request
      .json()
      .catch(() => null)) as FlowSnapshot | null;
    console.log("[api/send] snapshot:", body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/send] error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
