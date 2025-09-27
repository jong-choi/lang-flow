import { NextResponse } from "next/server";
import { listCreditHistory } from "@/app/api/credit/_controllers/history";
import {
  creditHistoryListResponseSchema,
  creditHistoryQuerySchema,
} from "@/features/credit/types/credit-apis";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = creditHistoryQuerySchema.safeParse({
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
    const responseBody = creditHistoryListResponseSchema.parse(result);
    return NextResponse.json(responseBody);
  } catch (error) {
    console.error("크레딧 히스토리 조회 실패", error);
    return NextResponse.json(
      { message: "크레딧 히스토리를 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}
