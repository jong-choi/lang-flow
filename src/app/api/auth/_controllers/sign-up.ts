import bcrypt from "bcryptjs";
import { ConflictError, ServerError } from "@/app/api/auth/_utils/errors";
import {
  insertUser,
  selectUserByEmail,
} from "@/features/auth/db/queries/users";
import type {
  SignUpFormValues,
  SignUpResponse,
} from "@/features/auth/types/sign-up";
import { db } from "@/lib/db";

export const signUp = async (
  payload: SignUpFormValues,
): Promise<SignUpResponse> => {
  const existing = await selectUserByEmail(db, payload.email);
  if (existing) {
    throw new ConflictError("이미 사용 중인 이메일입니다");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const created = await insertUser(db, {
    email: payload.email,
    name: payload.name ?? null,
    hashedPassword,
  });

  if (!created) {
    throw new ServerError("회원가입에 실패했습니다.");
  }

  return {
    id: created.id,
    email: created.email,
  };
};
