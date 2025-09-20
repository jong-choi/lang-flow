import { NextResponse } from "next/server";

export const runtime = "nodejs";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// GET /api/delay?id=<nodeId>
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  // 서버 로깅: 전달받은 노드 ID
  console.log("[api/delay] node id:", id);

  if (!id) {
    return NextResponse.json(
      { ok: false, error: "id가 필요합니다" },
      { status: 400 },
    );
  }

  // 5초 대기(처리 시뮬레이션)
  await delay(5000);

  // 일정 확률(30%)로 실패 응답
  const failProbability = 0.3;
  if (Math.random() < failProbability) {
    return NextResponse.json(
      { ok: false, error: "무작위 오류" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, id });
}
