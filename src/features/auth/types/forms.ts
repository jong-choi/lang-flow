import { z } from "zod";

const emailSchema = z
  .email({ error: "이메일 형식이 올바르지 않습니다." })
  .trim()
  .min(1, { error: "이메일을 입력해주세요." })
  .toLowerCase();

const passwordSchema = z
  .string({ error: "비밀번호를 입력해주세요." })
  .min(8, { error: "비밀번호는 최소 8자 이상이어야 합니다." });

const optionalNameSchema = z
  .string()
  .trim()
  .max(50, { error: "이름은 50자 이하로 입력해주세요." })
  .min(1, { error: "이름을 입력해주세요." });

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = signInSchema.extend({
  name: optionalNameSchema,
});

export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
