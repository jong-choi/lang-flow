import type { Credit, CreditSummary } from "@/features/credit/types/credit";

export const toCreditSummary: (row: Credit) => CreditSummary = (row) => ({
  userId: row.userId,
  balance: row.balance,
  isConsumptionDisabled: row.isConsumptionDisabled,
  createdAt: row.createdAt ?? null,
  updatedAt: row.updatedAt ?? null,
});
