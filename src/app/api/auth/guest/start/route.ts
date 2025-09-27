import { NextResponse } from "next/server";
import { startGuest } from "@/app/api/auth/_controllers/guest-start";
import { AuthError } from "@/app/api/auth/_utils/errors";
import { authSessionResponseSchema } from "@/features/auth/types/user";

export const runtime = "nodejs";

export async function POST() {
  try {
    const result = await startGuest();
    const responseBody = authSessionResponseSchema.parse(result);

    return NextResponse.json(responseBody);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("startGuest error", error);
    return NextResponse.json(
      { error: "게스트 계정을 생성하는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
