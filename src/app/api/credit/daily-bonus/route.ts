import { NextResponse } from "next/server";
import { grantDailyCheckInBonus } from "@/app/api/credit/_controllers/daily-bonus";
import { auth } from "@/features/auth/lib/auth";
import { creditDailyBonusResponseSchema } from "@/features/credit/types/credit-apis";

export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

  try {
    const result = await grantDailyCheckInBonus({ userId });
    const responseBody = creditDailyBonusResponseSchema.parse({
      credit: result.summary,
      history: result.history,
      granted: result.granted,
      lastCheckInAt: result.lastCheckInAt ?? null,
    });

    return NextResponse.json(responseBody, {
      status: result.granted ? 201 : 200,
    });
  } catch (error) {
    console.error("체크인 보상 지급 실패", error);
    return NextResponse.json(
      { message: "체크인 보상을 처리하지 못했습니다." },
      { status: 500 },
    );
  }
}
