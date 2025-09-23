import { and, desc, eq, gte, sql } from "drizzle-orm";
import {
  creditHistories,
  type creditHistoryTypeEnum,
  credits,
} from "@/features/credit/db/schema";
import { db } from "@/lib/db";

type TransactionClient = Parameters<Parameters<typeof db.transaction>[0]>[0];

type CreditRecord = typeof credits.$inferSelect;
type CreditHistoryRecord = typeof creditHistories.$inferSelect;

export interface CreditSummary {
  userId: string;
  balance: number;
  isConsumptionDisabled: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface CreditHistoryItem {
  id: string;
  userId: string;
  type: (typeof creditHistoryTypeEnum.enumValues)[number];
  amount: number;
  balanceAfter: number;
  description: string | null;
  createdAt: Date;
}

export interface CreditHistoryList {
  histories: CreditHistoryItem[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export class CreditOperationError extends Error {}

export class InvalidCreditAmountError extends CreditOperationError {
  constructor(message = "크레딧 변동 금액이 올바르지 않습니다.") {
    super(message);
    this.name = "InvalidCreditAmountError";
  }
}

export class InsufficientCreditError extends CreditOperationError {
  constructor(message = "크레딧이 부족합니다.") {
    super(message);
    this.name = "InsufficientCreditError";
  }
}

const toSummary = (row: CreditRecord): CreditSummary => ({
  userId: row.userId,
  balance: row.balance,
  isConsumptionDisabled: row.isConsumptionDisabled,
  createdAt: row.createdAt ?? null,
  updatedAt: row.updatedAt ?? null,
});

const loadCreditForUpdate = async (
  transaction: TransactionClient,
  userId: string,
) => {
  const [credit] = await transaction
    .select()
    .from(credits)
    .where(eq(credits.userId, userId))
    .for("update");

  return credit ?? null;
};

const ensureCreditRecord = async (
  transaction: TransactionClient,
  userId: string,
): Promise<CreditRecord> => {
  const existing = await loadCreditForUpdate(transaction, userId);

  if (existing) {
    return existing;
  }

  const [created] = await transaction
    .insert(credits)
    .values({ userId })
    .onConflictDoNothing()
    .returning();

  if (created) {
    return created;
  }

  const reloaded = await loadCreditForUpdate(transaction, userId);

  if (!reloaded) {
    throw new Error("크레딧 정보를 생성하지 못했습니다.");
  }

  return reloaded;
};

const toHistoryItem = (row: CreditHistoryRecord): CreditHistoryItem => ({
  id: row.id,
  userId: row.userId,
  type: row.type,
  amount: row.amount,
  balanceAfter: row.balanceAfter,
  description: row.description ?? null,
  createdAt: row.createdAt,
});

export const getCreditSummary = async (
  userId: string,
): Promise<CreditSummary> => {
  const [row] = await db
    .select()
    .from(credits)
    .where(eq(credits.userId, userId))
    .limit(1);

  if (!row) {
    return {
      userId,
      balance: 0,
      isConsumptionDisabled: false,
      createdAt: null,
      updatedAt: null,
    } satisfies CreditSummary;
  }

  return toSummary(row);
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

    const [updated] = await transaction
      .update(credits)
      .set({
        isConsumptionDisabled,
        updatedAt: new Date(),
      })
      .where(eq(credits.userId, userId))
      .returning();

    if (!updated) {
      throw new Error("크레딧 정보를 갱신하지 못했습니다.");
    }

    return toSummary(updated);
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
    throw new InvalidCreditAmountError("충전 금액은 0보다 커야 합니다.");
  }

  return db.transaction(async (transaction) => {
    await ensureCreditRecord(transaction, userId);

    const [updated] = await transaction
      .update(credits)
      .set({
        balance: sql`${credits.balance} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(credits.userId, userId))
      .returning();

    if (!updated) {
      throw new Error("크레딧 잔액을 갱신하지 못했습니다.");
    }

    const updatedCredit = updated;

    const [history] = await transaction
      .insert(creditHistories)
      .values({
        userId,
        type: "charge",
        amount,
        balanceAfter: updatedCredit.balance,
        description: description ?? null,
      })
      .returning();

    return {
      summary: toSummary(updatedCredit),
      history: toHistoryItem(history),
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
    throw new InvalidCreditAmountError("차감 금액은 0보다 커야 합니다.");
  }

  return db.transaction(async (transaction) => {
    const credit = await ensureCreditRecord(transaction, userId);

    if (skipConsumption || credit.isConsumptionDisabled) {
      const [history] = await transaction
        .insert(creditHistories)
        .values({
          userId,
          type: "skip",
          amount: 0,
          balanceAfter: credit.balance,
          description: description ?? null,
        })
        .returning();

      return {
        summary: toSummary(credit),
        history: toHistoryItem(history),
      };
    }

    const [updated] = await transaction
      .update(credits)
      .set({
        balance: sql`${credits.balance} - ${amount}`,
        updatedAt: new Date(),
      })
      .where(and(eq(credits.userId, userId), gte(credits.balance, amount)))
      .returning();

    if (!updated) {
      throw new InsufficientCreditError();
    }

    const updatedCredit = updated;

    const [history] = await transaction
      .insert(creditHistories)
      .values({
        userId,
        type: "consume",
        amount: -amount,
        balanceAfter: updatedCredit.balance,
        description: description ?? null,
      })
      .returning();

    return {
      summary: toSummary(updatedCredit),
      history: toHistoryItem(history),
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
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const safeOffset = Math.max(Math.trunc(offset), 0);

  const histories = await db
    .select()
    .from(creditHistories)
    .where(eq(creditHistories.userId, userId))
    .orderBy(desc(creditHistories.createdAt))
    .limit(safeLimit)
    .offset(safeOffset);

  const [totalRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(creditHistories)
    .where(eq(creditHistories.userId, userId));

  return {
    histories: histories.map((history) => toHistoryItem(history)),
    pagination: {
      limit: safeLimit,
      offset: safeOffset,
      total: totalRow?.total ?? 0,
    },
  };
};
