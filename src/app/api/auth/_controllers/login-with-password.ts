import { InvalidCredentialsError } from "@/app/api/auth/_utils/errors";
import { toAuthSessionResponse } from "@/app/api/auth/_utils/mappers";
import { verifyUserPassword } from "@/features/auth/lib/password-auth";
import { createSessionForUser } from "@/features/auth/lib/session";
import type { SignInFormValues } from "@/features/auth/types/sign-in";

type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

export const loginWithPassword = async (payload: SignInFormValues) => {
  const user = await verifyUserPassword(payload.email, payload.password);
  if (!user) {
    throw new InvalidCredentialsError();
  }

  const { expires } = await createSessionForUser(user.id);

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    image: user.image ?? null,
  };

  return toAuthSessionResponse(sessionUser, expires);
};
