import { NextResponse } from "next/server";
import { z } from "zod";
import {
  InvalidCreditAmountError,
  chargeCredit,
} from "@/app/api/credit/_controllers/credit";

const chargeSchema = z.object({
  userId: z.string().min(1, "사용자 ID는 필수입니다."),
  amount: z.number().int().min(1, "충전 금액은 1 이상이어야 합니다."),
  description: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as unknown;
    const parsed = chargeSchema.safeParse(body);

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "요청 본문을 확인해주세요.";
      return NextResponse.json({ message }, { status: 400 });
    }

    const result = await chargeCredit(parsed.data);

    return NextResponse.json({
      credit: result.summary,
      history: result.history,
    });
  } catch (error) {
    if (error instanceof InvalidCreditAmountError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    console.error("크레딧 충전 실패", error);
    return NextResponse.json(
      { message: "크레딧을 충전하지 못했습니다." },
      { status: 500 },
    );
  }
}
