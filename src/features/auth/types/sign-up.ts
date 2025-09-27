import { z } from "zod";
import { signInSchema } from "@/features/auth/types/sign-in";
import { authUserResponseSchema } from "@/features/auth/types/user";

const nameSchema = z
  .string()
  .trim()
  .max(50, { message: "이름은 50자 이하로 입력해주세요." })
  .min(1, { message: "이름을 입력해주세요." });

export const signUpSchema = signInSchema.extend({
  name: nameSchema,
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export const signUpResponseSchema = authUserResponseSchema.pick({
  id: true,
  email: true,
});

export type SignUpResponse = z.infer<typeof signUpResponseSchema>;
