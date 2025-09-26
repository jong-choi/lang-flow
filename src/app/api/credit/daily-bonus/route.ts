import { NextResponse } from "next/server";
import { z } from "zod";
import { grantDailyAttendanceBonus } from "@/app/api/credit/_controllers/credit";
import { auth } from "@/features/auth/lib/auth";

const requestSchema = z
  .object({
    amount: z.number().int().positive().optional(),
  })
  .optional();

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json().catch(() => null)) as unknown;
    const parsed = requestSchema.safeParse(body);
    const amount = parsed.success && parsed.data?.amount ? parsed.data.amount : 10;

    const result = await grantDailyAttendanceBonus({
      userId,
      amount,
    });

    return NextResponse.json(
      {
        credit: result.summary,
        history: result.history,
        granted: result.granted,
      },
      { status: result.granted ? 201 : 200 },
    );
  } catch (error) {
    console.error("출석 보상 지급 실패", error);
    return NextResponse.json(
      { message: "출석 보상을 처리하지 못했습니다." },
      { status: 500 },
    );
  }
}
