import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import type { AuthConfig } from "@auth/core";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

type UserRecord = typeof users.$inferSelect;

export const verifyUserPassword = async (
  email: string,
  password: string,
): Promise<UserRecord | null> => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !user.hashedPassword) return null;

  const ok = await bcrypt.compare(password, user.hashedPassword);
  if (!ok) return null;

  return user;
};

export const getSessionCookieConfig = (
  useSecureCookies: boolean,
  config: AuthConfig,
) => {
  const override = config.cookies?.sessionToken;
  const defaultNamePrefix = useSecureCookies ? "__Secure-" : "";
  const cookieName =
    override?.name ?? `${defaultNamePrefix}authjs.session-token`;

  const defaultOptions = {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: useSecureCookies,
  } as const;

  return {
    name: cookieName,
    options: {
      ...defaultOptions,
      ...override?.options,
    },
  };
};
