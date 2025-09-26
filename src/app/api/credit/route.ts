import { NextResponse } from "next/server";
import { setConsumptionFlag } from "@/app/api/credit/_controllers/consumption-flag";
import { getCreditSummary } from "@/app/api/credit/_controllers/summary";
import {
  creditConsumptionFlagRequestSchema,
  creditConsumptionFlagResponseSchema,
  creditSummaryQuerySchema,
  creditSummaryResponseSchema,
} from "@/types/credit/credit-schemas";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = creditSummaryQuerySchema.safeParse({
      userId: searchParams.get("userId") ?? "",
    });

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "요청 파라미터를 확인해주세요.";
      return NextResponse.json({ message }, { status: 400 });
    }

    const summary = await getCreditSummary(parsed.data.userId);
    const responseBody = creditSummaryResponseSchema.parse({
      credit: summary,
    });
    return NextResponse.json(responseBody);
  } catch (error) {
    console.error("크레딧 조회 실패", error);
    return NextResponse.json(
      { message: "크레딧 정보를 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = creditConsumptionFlagRequestSchema.safeParse(body);

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "요청 본문을 확인해주세요.";
      return NextResponse.json({ message }, { status: 400 });
    }

    const summary = await setConsumptionFlag(parsed.data);
    const responseBody = creditConsumptionFlagResponseSchema.parse({
      credit: summary,
    });
    return NextResponse.json(responseBody);
  } catch (error) {
    console.error("크레딧 플래그 갱신 실패", error);
    return NextResponse.json(
      { message: "플래그를 갱신하지 못했습니다." },
      { status: 500 },
    );
  }
}
