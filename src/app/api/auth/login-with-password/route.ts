import { NextResponse } from "next/server";
import { z } from "zod";
import { loginWithPassword } from "@/app/api/auth/_controllers/login-with-password";
import { AuthError } from "@/app/api/auth/_utils/errors";
import { signInSchema } from "@/features/auth/types/sign-in";
import { authSessionResponseSchema } from "@/features/auth/types/user";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = signInSchema.safeParse(body);

    if (!parsed.success) {
      const { formErrors, fieldErrors } = z.flattenError(parsed.error);
      const fieldMessage = Object.values(fieldErrors).find(
        (messages): messages is string[] =>
          Array.isArray(messages) && messages.length > 0,
      )?.[0];
      const message =
        formErrors[0] ?? fieldMessage ?? "이메일 또는 비밀번호를 확인해주세요.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const result = await loginWithPassword(parsed.data);
    const responseBody = authSessionResponseSchema.parse(result);

    return NextResponse.json(responseBody);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("loginWithPassword error", error);
    return NextResponse.json(
      { error: "로그인 처리 중 문제가 발생했습니다." },
      { status: 500 },
    );
  }
}
