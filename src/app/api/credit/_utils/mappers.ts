import type {
  Credit,
  CreditHistory,
  CreditSummary,
} from "@/features/credit/types/credit";

export const toCreditSummary: (row: Credit) => CreditSummary = (row) => ({
  userId: row.userId,
  balance: row.balance,
  isConsumptionDisabled: row.isConsumptionDisabled,
  createdAt: row.createdAt ?? null,
  updatedAt: row.updatedAt ?? null,
});

export const toHistoryItem: (row: CreditHistory) => CreditHistory = (row) => ({
  id: row.id,
  userId: row.userId,
  type: row.type,
  amount: row.amount,
  balanceAfter: row.balanceAfter,
  description: row.description ?? null,
  createdAt: row.createdAt,
});
