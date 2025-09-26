import { isGrantedToday } from "@/app/api/credit/_utils/dates";
import { toCreditSummary } from "@/app/api/credit/_utils/mappers";
import { coercePagination } from "@/app/api/credit/_utils/pagination";
import {
  insertCreditIfAbsent,
  selectCreditByUserId,
  updateConsumptionDisabled,
  updateCreditBalance,
  updateCreditBalanceWithGuard,
} from "@/features/credit/db/queries/credits";
import {
  countHistories,
  insertHistory,
  listHistories,
  selectLastDailyCheckIn,
} from "@/features/credit/db/queries/histories";
import type { credits } from "@/features/credit/db/schema";
import type {
  CreditHistory,
  CreditHistoryList,
  CreditSummary,
} from "@/features/credit/types/credit";
import {
  CHECK_IN_DESCRIPTION,
  DAILY_CHECK_IN_CREDIT_AMOUNT,
} from "@/features/credit/utils/constants";
import { type TransactionClient, db } from "@/lib/db";

const ensureCreditRecord = async (
  transaction: TransactionClient,
  userId: string,
): Promise<typeof credits.$inferSelect> => {
  const existing = await selectCreditByUserId(transaction, userId, {
    forUpdate: true,
  });
  if (existing) return existing;

  const created = await insertCreditIfAbsent(transaction, userId);
  if (created) return created;

  const reloaded = await selectCreditByUserId(transaction, userId, {
    forUpdate: true,
  });
  if (!reloaded) throw new Error("크레딧 정보를 생성하지 못했습니다.");
  return reloaded;
};

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
      history: history,
      granted: true,
      lastCheckInAt: history.createdAt,
    };
  });
};

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

export const setConsumptionFlag = async ({
  userId,
  isConsumptionDisabled,
}: {
  userId: string;
  isConsumptionDisabled: boolean;
}): Promise<CreditSummary> => {
  return db.transaction(async (transaction) => {
    await ensureCreditRecord(transaction, userId);
    const updated = await updateConsumptionDisabled(
      transaction,
      userId,
      isConsumptionDisabled,
      new Date(),
    );
    if (!updated) throw new Error("크레딧 정보를 갱신하지 못했습니다.");
    return toCreditSummary(updated);
  });
};

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
      history: history,
    };
  });
};

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
        history: history,
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
      history: history,
    };
  });
};

export const listCreditHistory = async ({
  userId,
  limit = 20,
  offset = 0,
}: {
  userId: string;
  limit?: number;
  offset?: number;
}): Promise<CreditHistoryList> => {
  const { limit: safeLimit, offset: safeOffset } = coercePagination({
    limit,
    offset,
  });

  const histories = await listHistories(db, userId, safeLimit, safeOffset);
  const total = await countHistories(db, userId);

  return {
    histories: histories.map((history: CreditHistory) => history),
    pagination: {
      limit: safeLimit,
      offset: safeOffset,
      total,
    },
  };
};
