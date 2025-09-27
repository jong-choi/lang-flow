import bcrypt from "bcryptjs";
import { ServerError } from "@/app/api/auth/_utils/errors";
import {
  createGuestIdentity,
  generateGuestPassword,
} from "@/app/api/auth/_utils/guest";
import { toAuthSessionResponse } from "@/app/api/auth/_utils/mappers";
import {
  insertUser,
  selectUserByEmail,
} from "@/features/auth/db/queries/users";
import { createSessionForUser } from "@/features/auth/lib/session";
import type { AuthSessionResponse } from "@/features/auth/types/user";
import { db } from "@/lib/db";

export const startGuest = async (): Promise<AuthSessionResponse> => {
  let created: Awaited<ReturnType<typeof insertUser>> | null = null;

  for (let attempt = 0; attempt < 2 && !created; attempt++) {
    const { email, displayName } = createGuestIdentity();
    const password = generateGuestPassword();

    const existing = await selectUserByEmail(db, email);
    if (existing) {
      continue;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      created = await insertUser(db, {
        email,
        name: `게스트 ${displayName}`,
        hashedPassword,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/duplicate|unique/i.test(message)) {
        continue;
      }
      throw error;
    }
  }

  if (!created) {
    throw new ServerError("게스트 계정을 생성하지 못했습니다.");
  }

  const { expires } = await createSessionForUser(created.id);

  return toAuthSessionResponse(
    {
      id: created.id,
      email: created.email,
      name: created.name ?? null,
      image: created.image ?? null,
    },
    expires,
  );
};
