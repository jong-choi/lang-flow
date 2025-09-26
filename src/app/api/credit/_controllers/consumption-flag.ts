import { ensureCreditRecord } from "@/app/api/credit/_controllers/shared";
import { toCreditSummary } from "@/app/api/credit/_utils/mappers";
import { updateConsumptionDisabled } from "@/features/credit/db/queries/credits";
import { db } from "@/lib/db";

export const setConsumptionFlag = async ({
  userId,
  isConsumptionDisabled,
}: {
  userId: string;
  isConsumptionDisabled: boolean;
}) => {
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
