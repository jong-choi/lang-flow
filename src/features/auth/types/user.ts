import type { InferSelectModel } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "@/lib/db/schema";

export type AuthUser = InferSelectModel<typeof users>;

export const authUserInsertSchema = createInsertSchema(users, {
  email: () =>
    z.preprocess(
      (val) => (typeof val === "string" ? val.trim().toLowerCase() : val),
      z
        .email("이메일 형식이 올바르지 않습니다.")
        .refine((v) => typeof v === "string" && v.length > 0, {
          message: "이메일을 입력해주세요.",
        }),
    ),
  name: () =>
    z
      .string()
      .trim()
      .max(50, "이름은 50자 이하로 입력해주세요.")
      .optional()
      .nullable(),
});

export const authUserResponseSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string().nullable(),
  image: z.string().nullable(),
});

const authSessionSchema = z.object({
  expires: z.string(),
});
export type AuthSession = z.infer<typeof authSessionSchema>;

export const authSessionResponseSchema = z.object({
  ok: z.literal(true),
  user: authUserResponseSchema,
  session: authSessionSchema,
});

export type AuthSessionResponse = z.infer<typeof authSessionResponseSchema>;
