import { toCreditSummary } from "@/app/api/credit/_utils/mappers";
import { selectCreditByUserId } from "@/features/credit/db/queries/credits";
import type { CreditSummary } from "@/features/credit/types/credit";
import { db } from "@/lib/db";

export const getCreditSummary = async (
  userId: string,
): Promise<CreditSummary> => {
  const row = await selectCreditByUserId(db, userId);
  if (!row) {
    return {
      userId,
      balance: 0,
      isConsumptionDisabled: false,
      createdAt: null,
      updatedAt: null,
    } satisfies CreditSummary;
  }
  return toCreditSummary(row);
};
