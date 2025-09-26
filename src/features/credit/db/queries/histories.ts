import { and, desc, eq, sql } from "drizzle-orm";
import { creditHistories } from "@/features/credit/db/schema";
import type {
  CreditHistory,
  CreditHistoryInsert,
} from "@/features/credit/types/credit";
import type { DBClient } from "@/lib/db";

export const insertHistory: (
  client: DBClient,
  input: CreditHistoryInsert,
) => Promise<CreditHistory> = async (client, input) => {
  const [history] = await client
    .insert(creditHistories)
    .values(input)
    .returning();
  return history ?? null;
};

export const selectLastDailyCheckIn = async (
  client: DBClient,
  userId: string,
  description: string,
) => {
  const [row] = await client
    .select({ createdAt: creditHistories.createdAt })
    .from(creditHistories)
    .where(
      and(
        eq(creditHistories.userId, userId),
        eq(creditHistories.type, "charge"),
        eq(creditHistories.description, description),
      ),
    )
    .orderBy(desc(creditHistories.createdAt))
    .limit(1);
  return row ?? null;
};

export const listHistories: (
  client: DBClient,
  userId: string,
  limit: number,
  offset: number,
) => Promise<CreditHistory[]> = async (client, userId, limit, offset) => {
  return client
    .select()
    .from(creditHistories)
    .where(eq(creditHistories.userId, userId))
    .orderBy(desc(creditHistories.createdAt))
    .limit(limit)
    .offset(offset);
};

export const countHistories = async (client: DBClient, userId: string) => {
  const [row] = await client
    .select({ total: sql<number>`count(*)::int` })
    .from(creditHistories)
    .where(eq(creditHistories.userId, userId));
  return row?.total ?? 0;
};
