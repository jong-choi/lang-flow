import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import {
  creditHistories,
  creditHistoryTypeEnum,
  credits,
} from "@/features/credit/db/schema";

const creditSelectSchema = createSelectSchema(credits);
const creditHistorySelectSchema = createSelectSchema(creditHistories);

const creditHistoryTypeValues = creditHistoryTypeEnum.enumValues;

const creditSummaryShape = creditSelectSchema.shape;
const requiredUserIdMessage = "사용자 ID는 필수입니다.";

const toNullableIsoString = (value: Date | null) =>
  value ? value.toISOString() : null;

const toIsoString = (value: Date) => value.toISOString();

const buildPositiveIntSchema = (message: string) =>
  z.number().int().min(1, message);

export const userIdSchema = z.string().min(1, requiredUserIdMessage);

export const nullableDateToIsoStringSchema = z
  .date()
  .nullable()
  .transform((value) => toNullableIsoString(value));

export const creditSummarySchema = z.object({
  userId: creditSummaryShape.userId,
  balance: creditSummaryShape.balance,
  isConsumptionDisabled: creditSummaryShape.isConsumptionDisabled,
  createdAt: creditSummaryShape.createdAt.nullable(),
  updatedAt: creditSummaryShape.updatedAt.nullable(),
});

export const creditSummaryDtoSchema = creditSummarySchema.transform((data) => ({
  ...data,
  createdAt: toNullableIsoString(data.createdAt),
  updatedAt: toNullableIsoString(data.updatedAt),
}));

export const creditHistorySchema = creditHistorySelectSchema;

export const creditHistoryDtoSchema = creditHistorySchema.transform(
  (history) => ({
    ...history,
    createdAt: toIsoString(history.createdAt),
  }),
);

type CreditHistoryTypeLiteral = (typeof creditHistoryTypeValues)[number];

export const creditHistoryTypeSchema = z.enum(
  creditHistoryTypeValues as [
    CreditHistoryTypeLiteral,
    ...CreditHistoryTypeLiteral[],
  ],
);

export const paginationSchema = z.object({
  limit: z.number().int().nonnegative(),
  offset: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

export const creditSummaryQuerySchema = z.object({
  userId: userIdSchema,
});

export const creditSummaryResponseSchema = z.object({
  credit: creditSummaryDtoSchema,
});

export const creditConsumptionFlagRequestSchema = z.object({
  userId: userIdSchema,
  isConsumptionDisabled: z.boolean(),
});

export const creditConsumptionFlagResponseSchema = creditSummaryResponseSchema;

export const creditChargeRequestSchema = z.object({
  userId: userIdSchema,
  amount: buildPositiveIntSchema("충전 금액은 1 이상이어야 합니다."),
  description: z.string().optional().nullable(),
});

export const creditConsumeRequestSchema = z.object({
  userId: userIdSchema,
  amount: buildPositiveIntSchema("차감 금액은 1 이상이어야 합니다."),
  description: z.string().optional().nullable(),
  skipConsumption: z.boolean().optional(),
});

const creditMutationResponseSchema = z.object({
  credit: creditSummaryDtoSchema,
  history: creditHistoryDtoSchema,
});

export const creditChargeResponseSchema = creditMutationResponseSchema;
export const creditConsumeResponseSchema = creditMutationResponseSchema;

export const creditDailyBonusResponseSchema = z.object({
  credit: creditSummaryDtoSchema,
  history: creditHistoryDtoSchema.nullable(),
  granted: z.boolean(),
  lastCheckInAt: nullableDateToIsoStringSchema,
});

export const creditHistoryQuerySchema = z.object({
  userId: userIdSchema,
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const creditHistoryListResponseSchema = z.object({
  histories: z.array(creditHistoryDtoSchema),
  pagination: paginationSchema,
});

export type CreditSummaryInput = z.input<typeof creditSummarySchema>;
export type CreditSummaryDto = z.output<typeof creditSummaryDtoSchema>;
export type CreditSummaryQuery = z.infer<typeof creditSummaryQuerySchema>;
export type CreditSummaryResponse = z.infer<typeof creditSummaryResponseSchema>;
export type CreditConsumptionFlagRequest = z.infer<
  typeof creditConsumptionFlagRequestSchema
>;
export type CreditConsumptionFlagResponse = z.infer<
  typeof creditConsumptionFlagResponseSchema
>;
export type CreditChargeRequest = z.infer<typeof creditChargeRequestSchema>;
export type CreditChargeResponse = z.infer<typeof creditChargeResponseSchema>;
export type CreditConsumeRequest = z.infer<typeof creditConsumeRequestSchema>;
export type CreditConsumeResponse = z.infer<typeof creditConsumeResponseSchema>;
export type CreditDailyBonusResponse = z.infer<
  typeof creditDailyBonusResponseSchema
>;

export type CreditHistoryInput = z.input<typeof creditHistorySchema>;
export type CreditHistoryDto = z.output<typeof creditHistoryDtoSchema>;
export type CreditHistoryQuery = z.infer<typeof creditHistoryQuerySchema>;
export type CreditHistoryListResponse = z.infer<
  typeof creditHistoryListResponseSchema
>;

export type CreditHistoryType = CreditHistoryTypeLiteral;
export type Pagination = z.infer<typeof paginationSchema>;
