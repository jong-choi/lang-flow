import { and, eq, gte, sql } from "drizzle-orm";
import { credits } from "@/features/credit/db/schema";
import type { DBClient } from "@/lib/db";

export const selectCreditByUserId = async (
  client: DBClient,
  userId: string,
  { forUpdate = false }: { forUpdate?: boolean } = {},
) => {
  const query = client.select().from(credits).where(eq(credits.userId, userId));
  const rows = forUpdate ? await query.for("update") : await query;
  const [row] = rows;
  return row ?? null;
};

export const insertCreditIfAbsent = async (
  client: DBClient,
  userId: string,
) => {
  const [created] = await client
    .insert(credits)
    .values({ userId })
    .onConflictDoNothing()
    .returning();
  return created ?? null;
};

export const updateCreditBalance = async (
  client: DBClient,
  userId: string,
  delta: number,
  updatedAt: Date,
) => {
  const [updated] = await client
    .update(credits)
    .set({
      balance:
        delta >= 0
          ? sql`${credits.balance} + ${delta}`
          : sql`${credits.balance} - ${-delta}`,
      updatedAt,
    })
    .where(eq(credits.userId, userId))
    .returning();
  return updated ?? null;
};

export const updateCreditBalanceWithGuard = async (
  client: DBClient,
  userId: string,
  consumeAmount: number,
) => {
  const [updated] = await client
    .update(credits)
    .set({
      balance: sql`${credits.balance} - ${consumeAmount}`,
      updatedAt: new Date(),
    })
    .where(and(eq(credits.userId, userId), gte(credits.balance, consumeAmount)))
    .returning();
  return updated ?? null;
};

export const updateConsumptionDisabled = async (
  client: DBClient,
  userId: string,
  isConsumptionDisabled: boolean,
  updatedAt: Date,
) => {
  const [updated] = await client
    .update(credits)
    .set({ isConsumptionDisabled, updatedAt })
    .where(eq(credits.userId, userId))
    .returning();
  return updated ?? null;
};

