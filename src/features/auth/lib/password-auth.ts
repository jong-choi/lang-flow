import bcrypt from "bcryptjs";
import type { AuthConfig } from "@auth/core";
import { selectUserByEmail } from "@/features/auth/db/queries/users";
import type { AuthUser } from "@/features/auth/types/user";
import { db } from "@/lib/db";

export const verifyUserPassword = async (
  email: string,
  password: string,
): Promise<AuthUser | null> => {
  const user = await selectUserByEmail(db, email);

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
