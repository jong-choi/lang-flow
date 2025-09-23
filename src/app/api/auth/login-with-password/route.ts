import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authConfig } from "@/features/auth/lib/auth.config";
import {
  getSessionCookieConfig,
  verifyUserPassword,
} from "@/features/auth/lib/password-auth";
import {
  type SignInFormValues,
  signInSchema,
} from "@/features/auth/types/forms";

export const runtime = "nodejs";

const DEFAULT_SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

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

    const adapter = authConfig.adapter;

    if (!adapter) {
      return NextResponse.json(
        { error: "세션 어댑터가 설정되지 않았습니다." },
        { status: 500 },
      );
    }

    const sessionStrategy = authConfig.session?.strategy ?? "database";
    if (sessionStrategy !== "database") {
      return NextResponse.json(
        { error: "데이터베이스 세션 전략이 활성화되어 있지 않습니다." },
        { status: 500 },
      );
    }

    if (!adapter.createSession) {
      return NextResponse.json(
        { error: "세션 어댑터가 세션 생성을 지원하지 않습니다." },
        { status: 500 },
      );
    }

    const generateSessionToken = authConfig.session?.generateSessionToken;
    const sessionToken =
      typeof generateSessionToken === "function"
        ? generateSessionToken()
        : crypto.randomUUID();

    const sessionMaxAge = authConfig.session?.maxAge ?? DEFAULT_SESSION_MAX_AGE;
    const expires = new Date(Date.now() + sessionMaxAge * 1000);

    await adapter.createSession({
      sessionToken,
      userId: user.id,
      expires,
    });

    const isDevmode = process.env.NODE_ENV === "development";
    const useSecureCookies = authConfig.useSecureCookies ?? !isDevmode;

    // sameSite와 samdSite를 설정
    const sessionCookieConfig = getSessionCookieConfig(
      useSecureCookies,
      authConfig,
    );

    const cookieStore = await cookies();
    const cookieName = sessionCookieConfig.name;

    for (const existing of cookieStore.getAll()) {
      if (
        existing.name === cookieName ||
        existing.name.startsWith(`${cookieName}.`)
      ) {
        cookieStore.delete(existing.name);
      }
    }

    cookieStore.set(cookieName, sessionToken, {
      ...sessionCookieConfig.options,
      expires,
      maxAge: sessionMaxAge,
    });

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
