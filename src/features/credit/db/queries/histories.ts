import { and, desc, eq, sql } from "drizzle-orm";
import { creditHistories } from "@/features/credit/db/schema";
import type { DBClient } from "@/lib/db";

export const insertHistory = async (
  client: DBClient,
  input: {
    userId: string;
    type: "charge" | "consume" | "skip";
    amount: number;
    balanceAfter: number;
    description: string | null;
    createdAt?: Date;
  },
) => {
  const [history] = await client
    .insert(creditHistories)
    .values({
      userId: input.userId,
      type: input.type,
      amount: input.amount,
      balanceAfter: input.balanceAfter,
      description: input.description,
      createdAt: input.createdAt,
    })
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

export const listHistories = async (
  client: DBClient,
  userId: string,
  limit: number,
  offset: number,
) => {
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
