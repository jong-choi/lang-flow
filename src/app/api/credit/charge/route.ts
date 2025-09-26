import { NextResponse } from "next/server";
import { chargeCredit } from "@/app/api/credit/_controllers/charge";
import {
  creditChargeRequestSchema,
  creditChargeResponseSchema,
} from "@/types/credit/credit-schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = creditChargeRequestSchema.safeParse(body);

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "요청 본문을 확인해주세요.";
      return NextResponse.json({ message }, { status: 400 });
    }

    const result = await chargeCredit(parsed.data);

    const responseBody = creditChargeResponseSchema.parse({
      credit: result.summary,
      history: result.history,
    });

    return NextResponse.json(responseBody);
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message || String(error);
      if (/금액/.test(message)) {
        return NextResponse.json({ message }, { status: 400 });
      }
    }

    console.error("크레딧 충전 실패", error);
    return NextResponse.json(
      { message: "크레딧을 충전하지 못했습니다." },
      { status: 500 },
    );
  }
}
