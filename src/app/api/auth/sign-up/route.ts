import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import {
  type SignUpFormValues,
  signUpSchema,
} from "@/features/auth/types/forms";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

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

    const { email, name, password } = parsed.data satisfies SignUpFormValues;

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json(
        { message: "이미 사용 중인 이메일입니다" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [created] = await db
      .insert(users)
      .values({ email, name: name ?? null, hashedPassword })
      .returning({ id: users.id, email: users.email });

    return NextResponse.json(
      { id: created.id, email: created.email },
      { status: 201 },
    );
  } catch (err) {
    console.error("회원가입 오류", err);
    return NextResponse.json({ message: "서버 내부 오류" }, { status: 500 });
  }
}
