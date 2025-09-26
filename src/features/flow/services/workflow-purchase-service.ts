import { and, eq } from "drizzle-orm";
import { workflowLicenses, workflowShares } from "@/features/flow/db/schema";
import { db } from "@/lib/db";

export const getShareOwnerAndPrice = async (
  workflowId: string,
): Promise<{ ownerId: string; priceInCredits: number | null } | null> => {
  const [share] = await db
    .select({
      ownerId: workflowShares.ownerId,
      priceInCredits: workflowShares.priceInCredits,
    })
    .from(workflowShares)
    .where(eq(workflowShares.workflowId, workflowId))
    .limit(1);

  if (!share) return null;
  return { ownerId: share.ownerId, priceInCredits: share.priceInCredits };
};

export const hasUserWorkflowLicense = async (
  workflowId: string,
  userId: string,
): Promise<boolean> => {
  const [existing] = await db
    .select({ userId: workflowLicenses.userId })
    .from(workflowLicenses)
    .where(
      and(
        eq(workflowLicenses.workflowId, workflowId),
        eq(workflowLicenses.userId, userId),
      ),
    )
    .limit(1);
  return Boolean(existing);
};
