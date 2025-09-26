import { toHistoryItem } from "@/app/api/credit/_utils/mappers";
import { coercePagination } from "@/app/api/credit/_utils/pagination";
import {
  countHistories,
  listHistories,
} from "@/features/credit/db/queries/histories";
import type { CreditHistoryList } from "@/features/credit/types/credit";
import { db } from "@/lib/db";

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
    histories: histories.map((history) => toHistoryItem(history)),
    pagination: {
      limit: safeLimit,
      offset: safeOffset,
      total,
    },
  };
};
