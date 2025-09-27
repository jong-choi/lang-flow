import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { creditHistories, credits } from "@/features/credit/db/schema";

const creditBaseSchema = createSelectSchema(credits).pick({
  userId: true,
  balance: true,
  isConsumptionDisabled: true,
  createdAt: true,
  updatedAt: true,
});

const creditHistoryBaseSchema = createSelectSchema(creditHistories);

const userIdSchema = z.string().min(1, "사용자 ID는 필수입니다.");

const creditSummaryDtoSchema = creditBaseSchema.transform((credit) => ({
  ...credit,
  createdAt: credit.createdAt.toISOString(),
  updatedAt: credit.updatedAt.toISOString(),
}));

const creditHistoryDtoSchema = creditHistoryBaseSchema.transform((history) => ({
  ...history,
  createdAt: history.createdAt.toISOString(),
}));

const paginationSchema = z.object({
  limit: z.number().int().nonnegative(),
  offset: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

// 크레딧 요약 조회
export const creditSummaryQuerySchema = z.object({
  userId: userIdSchema,
});

export const creditSummaryResponseSchema = z.object({
  credit: creditSummaryDtoSchema,
});
export type CreditSummaryResponse = z.infer<typeof creditSummaryResponseSchema>;

// 소비 가능 여부 플래그 변경
export const creditConsumptionFlagRequestSchema = z.object({
  userId: userIdSchema,
  isConsumptionDisabled: z.boolean(),
});

export const creditConsumptionFlagResponseSchema = creditSummaryResponseSchema;

// 충전/차감 요청
export const creditChargeRequestSchema = z.object({
  userId: userIdSchema,
  amount: z.coerce.number().int().min(1, "충전 금액은 1 이상이어야 합니다."),
  description: z.string().optional().nullable(),
});

export const creditConsumeRequestSchema = z.object({
  userId: userIdSchema,
  amount: z.coerce.number().int().min(1, "차감 금액은 1 이상이어야 합니다."),
  description: z.string().optional().nullable(),
  skipConsumption: z.boolean().optional(),
});

// 공통 변동 응답
export const creditMutationResponseSchema = z.object({
  credit: creditSummaryDtoSchema,
  history: creditHistoryDtoSchema,
});

// 히스토리 목록
export const creditHistoryQuerySchema = z.object({
  userId: userIdSchema,
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const creditHistoryListResponseSchema = z.object({
  histories: z.array(creditHistoryDtoSchema),
  pagination: paginationSchema,
});

// 출석(데일리 보너스)
export const creditDailyBonusResponseSchema = z.object({
  credit: creditSummaryDtoSchema,
  history: creditHistoryDtoSchema.nullable(),
  granted: z.boolean(),
  lastCheckInAt: z
    .date()
    .nullable()
    .transform((date) => (date ? date.toISOString() : null)),
});

export type CreditDailyBonusResponse = z.infer<
  typeof creditDailyBonusResponseSchema
>;
