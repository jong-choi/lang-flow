import { ensureCreditRecord } from "@/app/api/credit/_controllers/shared";
import {
  toCreditSummary,
  toHistoryItem,
} from "@/app/api/credit/_utils/mappers";
import { updateCreditBalanceWithGuard } from "@/features/credit/db/queries/credits";
import { insertHistory } from "@/features/credit/db/queries/histories";
import { db } from "@/lib/db";

export const consumeCredit = async ({
  userId,
  amount,
  description,
  skipConsumption,
}: {
  userId: string;
  amount: number;
  description?: string | null;
  skipConsumption?: boolean;
}) => {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("차감 금액은 0보다 커야 합니다.");
  }

  return db.transaction(async (transaction) => {
    const credit = await ensureCreditRecord(transaction, userId);

    if (skipConsumption || credit.isConsumptionDisabled) {
      const history = await insertHistory(transaction, {
        userId,
        type: "skip",
        amount: 0,
        balanceAfter: credit.balance,
        description: description ?? null,
      });
      if (!history) throw new Error("크레딧 히스토리를 기록하지 못했습니다.");

      return {
        summary: toCreditSummary(credit),
        history: toHistoryItem(history),
      };
    }

    const updated = await updateCreditBalanceWithGuard(
      transaction,
      userId,
      amount,
    );
    if (!updated) throw new Error("크레딧이 부족합니다.");

    const history = await insertHistory(transaction, {
      userId,
      type: "consume",
      amount: -amount,
      balanceAfter: updated.balance,
      description: description ?? null,
    });
    if (!history) throw new Error("크레딧 히스토리를 기록하지 못했습니다.");

    return {
      summary: toCreditSummary(updated),
      history: toHistoryItem(history),
    };
  });
};
