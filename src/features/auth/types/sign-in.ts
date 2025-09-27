import { z } from "zod";
import { authUserInsertSchema } from "@/features/auth/types/user";

const passwordSchema = z
  .string("비밀번호를 입력해주세요.")
  .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." });

export const signInSchema = z.object({
  email: authUserInsertSchema.shape.email,
  password: passwordSchema,
});

export type SignInFormValues = z.infer<typeof signInSchema>;
