import type { AuthSessionResponse, AuthUser } from "@/features/auth/types/user";

type SessionUser = Pick<AuthUser, "id" | "email" | "name" | "image">;

export const toAuthSessionResponse = (
  user: SessionUser,
  expires: Date,
): AuthSessionResponse => ({
  ok: true,
  user: {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    image: user.image ?? null,
  },
  session: {
    expires: expires.toISOString(),
  },
});
