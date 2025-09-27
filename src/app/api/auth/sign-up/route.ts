import { NextResponse } from "next/server";
import { z } from "zod";
import { signUp } from "@/app/api/auth/_controllers/sign-up";
import { AuthError } from "@/app/api/auth/_utils/errors";
import {
  signUpResponseSchema,
  signUpSchema,
} from "@/features/auth/types/sign-up";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as unknown;
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      const { formErrors, fieldErrors } = z.flattenError(parsed.error);
      const fieldMessage = Object.values(fieldErrors).find(
        (messages): messages is string[] =>
          Array.isArray(messages) && messages.length > 0,
      )?.[0];
      const message = formErrors[0] ?? fieldMessage ?? "입력값을 확인해주세요.";
      return NextResponse.json({ message }, { status: 400 });
    }

    const created = await signUp(parsed.data);
    const responseBody = signUpResponseSchema.parse(created);

    return NextResponse.json(responseBody, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    console.error("회원가입 오류", error);
    return NextResponse.json({ message: "서버 내부 오류" }, { status: 500 });
  }
}
