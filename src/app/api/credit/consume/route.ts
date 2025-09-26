import { NextResponse } from "next/server";
import { z } from "zod";
import { consumeCredit } from "@/app/api/credit/_controllers/consume";

const consumeSchema = z.object({
  userId: z.string().min(1, "사용자 ID는 필수입니다."),
  amount: z.number().int().min(1, "차감 금액은 1 이상이어야 합니다."),
  description: z.string().optional().nullable(),
  skipConsumption: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = consumeSchema.safeParse(body);

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "요청 본문을 확인해주세요.";
      return NextResponse.json({ message }, { status: 400 });
    }

    const result = await consumeCredit(parsed.data);

    return NextResponse.json({
      credit: result.summary,
      history: result.history,
    });
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message || String(error);
      if (/금액|크레딧/.test(message)) {
        return NextResponse.json({ message }, { status: 400 });
      }
    }

    console.error("크레딧 차감 실패", error);
    return NextResponse.json(
      { message: "크레딧을 차감하지 못했습니다." },
      { status: 500 },
    );
  }
}
