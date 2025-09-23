import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getCreditSummary,
  setConsumptionFlag,
} from "@/app/api/credit/_controllers/credit";

const getQuerySchema = z.object({
  userId: z.string().min(1, "사용자 ID는 필수입니다."),
});

const updateFlagSchema = z.object({
  userId: z.string().min(1, "사용자 ID는 필수입니다."),
  isConsumptionDisabled: z.boolean(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = getQuerySchema.safeParse({
      userId: searchParams.get("userId") ?? "",
    });

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "요청 파라미터를 확인해주세요.";
      return NextResponse.json({ message }, { status: 400 });
    }

    const summary = await getCreditSummary(parsed.data.userId);
    return NextResponse.json({ credit: summary });
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
    const body = (await request.json().catch(() => null)) as unknown;
    const parsed = updateFlagSchema.safeParse(body);

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "요청 본문을 확인해주세요.";
      return NextResponse.json({ message }, { status: 400 });
    }

    const summary = await setConsumptionFlag(parsed.data);
    return NextResponse.json({ credit: summary });
  } catch (error) {
    console.error("크레딧 플래그 갱신 실패", error);
    return NextResponse.json(
      { message: "플래그를 갱신하지 못했습니다." },
      { status: 500 },
    );
  }
}
