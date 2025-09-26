import { NextResponse } from "next/server";
import { z } from "zod";
import { listCreditHistory } from "@/app/api/credit/_controllers/history";

const historyQuerySchema = z.object({
  userId: z.string().min(1, "사용자 ID는 필수입니다."),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = historyQuerySchema.safeParse({
      userId: searchParams.get("userId") ?? "",
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
    });

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "요청 파라미터를 확인해주세요.";
      return NextResponse.json({ message }, { status: 400 });
    }

    const result = await listCreditHistory(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("크레딧 히스토리 조회 실패", error);
    return NextResponse.json(
      { message: "크레딧 히스토리를 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}
