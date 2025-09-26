import {
  insertCreditIfAbsent,
  selectCreditByUserId,
} from "@/features/credit/db/queries/credits";
import type { credits } from "@/features/credit/db/schema";
import { type TransactionClient } from "@/lib/db";

export const ensureCreditRecord = async (
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
