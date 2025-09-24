import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionForUser } from "@/features/auth/lib/session";
import { verifyUserPassword } from "@/features/auth/lib/password-auth";
import {
  type SignInFormValues,
  signInSchema,
} from "@/features/auth/types/forms";

export const runtime = "nodejs";

// 아이디 비밀번호로 생성시 세션 생성
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as unknown;
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

    const { email, password } = parsed.data satisfies SignInFormValues;

    const user = await verifyUserPassword(email, password);
    if (!user) {
      return NextResponse.json(
        { error: "이메일 또는 비밀번호를 확인해주세요." },
        { status: 401 },
      );
    }

    const { expires } = await createSessionForUser(user.id);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
      session: {
        expires: expires.toISOString(),
      },
    });
  } catch (error) {
    console.error("loginWithPassword error", error);
    return NextResponse.json(
      { error: "로그인 처리 중 문제가 발생했습니다." },
      { status: 500 },
    );
  }
}
