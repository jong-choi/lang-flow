import { ensureCreditRecord } from "@/app/api/credit/_controllers/shared";
import { isGrantedToday } from "@/app/api/credit/_utils/dates";
import {
  toCreditSummary,
  toHistoryItem,
} from "@/app/api/credit/_utils/mappers";
import {
  CHECK_IN_DESCRIPTION,
  DAILY_CHECK_IN_CREDIT_AMOUNT,
} from "@/features/credit/constants";
import { updateCreditBalance } from "@/features/credit/db/queries/credits";
import {
  insertHistory,
  selectLastDailyCheckIn,
} from "@/features/credit/db/queries/histories";
import { db } from "@/lib/db";

export const grantDailyCheckInBonus = async ({
  userId,
  now = new Date(),
}: {
  userId: string;
  now?: Date;
}) => {
  const amount = DAILY_CHECK_IN_CREDIT_AMOUNT;
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("보상 금액이 올바르지 않습니다.");
  }

  return db.transaction(async (transaction) => {
    const credit = await ensureCreditRecord(transaction, userId);

    const lastCheckIn = await selectLastDailyCheckIn(
      transaction,
      userId,
      CHECK_IN_DESCRIPTION,
    );
    const grantedToday = isGrantedToday(lastCheckIn?.createdAt, now);

    if (grantedToday) {
      return {
        summary: toCreditSummary(credit),
        history: null,
        granted: false,
        lastCheckInAt: lastCheckIn?.createdAt ?? null,
      };
    }

    const updated = await updateCreditBalance(transaction, userId, amount, now);
    if (!updated) throw new Error("크레딧 잔액을 갱신하지 못했습니다.");

    const history = await insertHistory(transaction, {
      userId,
      type: "charge",
      amount,
      balanceAfter: updated.balance,
      description: CHECK_IN_DESCRIPTION,
      createdAt: now,
    });
    if (!history) throw new Error("체크인 히스토리를 기록하지 못했습니다.");

    return {
      summary: toCreditSummary(updated),
      history: toHistoryItem(history),
      granted: true,
      lastCheckInAt: history.createdAt,
    };
  });
};
