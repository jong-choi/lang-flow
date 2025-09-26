import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { authConfig } from "@/features/auth/lib/auth.config";
import { getSessionCookieConfig } from "@/features/auth/lib/password-auth";

const DEFAULT_SESSION_MAX_AGE = 30 * 24 * 60 * 60;

// Credentials에서 강제로 세션을 만드는 함수
export const createSessionForUser = async (userId: string) => {
  const adapter = authConfig.adapter;

  if (!adapter) {
    throw new Error("세션 어댑터가 설정되지 않았습니다.");
  }

  const sessionStrategy = authConfig.session?.strategy ?? "database";
  if (sessionStrategy !== "database") {
    throw new Error("데이터베이스 세션 전략이 활성화되어 있지 않습니다.");
  }

  if (!adapter.createSession) {
    throw new Error("세션 어댑터가 세션 생성을 지원하지 않습니다.");
  }

  const generateSessionToken = authConfig.session?.generateSessionToken;
  const sessionToken =
    typeof generateSessionToken === "function"
      ? generateSessionToken()
      : randomUUID();

  const sessionMaxAge = authConfig.session?.maxAge ?? DEFAULT_SESSION_MAX_AGE;
  const expires = new Date(Date.now() + sessionMaxAge * 1000);

  await adapter.createSession({
    sessionToken,
    userId,
    expires,
  });

  const isDevMode = process.env.NODE_ENV === "development";
  const useSecureCookies = authConfig.useSecureCookies ?? !isDevMode;

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

  return { sessionToken, expires } as const;
};
