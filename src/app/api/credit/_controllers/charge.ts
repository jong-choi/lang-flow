import { ensureCreditRecord } from "@/app/api/credit/_controllers/shared";
import {
  toCreditSummary,
  toHistoryItem,
} from "@/app/api/credit/_utils/mappers";
import { updateCreditBalance } from "@/features/credit/db/queries/credits";
import { insertHistory } from "@/features/credit/db/queries/histories";
import { db } from "@/lib/db";

export const chargeCredit = async ({
  userId,
  amount,
  description,
}: {
  userId: string;
  amount: number;
  description?: string | null;
}) => {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("충전 금액은 0보다 커야 합니다.");
  }

  return db.transaction(async (transaction) => {
    await ensureCreditRecord(transaction, userId);

    const updated = await updateCreditBalance(
      transaction,
      userId,
      amount,
      new Date(),
    );
    if (!updated) throw new Error("크레딧 잔액을 갱신하지 못했습니다.");

    const history = await insertHistory(transaction, {
      userId,
      type: "charge",
      amount,
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
