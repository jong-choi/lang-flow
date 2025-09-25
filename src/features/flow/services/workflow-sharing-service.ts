import { and, desc, eq, sql } from "drizzle-orm";
import { workflowLicenses, workflowShares, workflows } from "@/features/flow/db/schema";
import type {
  WorkflowShareDetail,
  WorkflowShareFormValues,
  WorkflowShareSummary,
} from "@/features/flow/types/workflow-sharing";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
};

const userCountExpr = sql<number>`coalesce(count(distinct ${workflowLicenses.userId}), 0)`;

export const listSharedWorkflows = async (): Promise<
  WorkflowShareSummary[]
> => {
  const rows = await db
    .select({
      share: workflowShares,
      workflow: {
        id: workflows.id,
        name: workflows.name,
        description: workflows.description,
      },
      owner: {
        id: users.id,
        name: users.name,
        image: users.image,
      },
      userCount: userCountExpr,
    })
    .from(workflowShares)
    .innerJoin(workflows, eq(workflowShares.workflowId, workflows.id))
    .leftJoin(users, eq(workflowShares.ownerId, users.id))
    .leftJoin(
      workflowLicenses,
      eq(workflowLicenses.workflowId, workflowShares.workflowId),
    )
    .groupBy(workflowShares.id, workflows.id, users.id)
    .orderBy(desc(workflowShares.updatedAt));

  return rows.map((row) => ({
    workflowId: row.share.workflowId,
    shareId: row.share.id,
    workflowName: row.workflow.name,
    workflowDescription: row.workflow.description ?? null,
    summary: row.share.summary,
    priceInCredits: row.share.priceInCredits,
    tags: toStringArray(row.share.tags),
    userCount: Number(row.userCount ?? 0),
    owner: {
      id: row.share.ownerId,
      name: row.owner?.name ?? null,
      image: row.owner?.image ?? null,
    },
    createdAt: row.share.createdAt,
    updatedAt: row.share.updatedAt,
  }));
};

export const getWorkflowShareDetail = async (
  workflowId: string,
  viewerId?: string,
): Promise<WorkflowShareDetail | null> => {
  const [row] = await db
    .select({
      share: workflowShares,
      workflow: {
        id: workflows.id,
        name: workflows.name,
        description: workflows.description,
      },
      owner: {
        id: users.id,
        name: users.name,
        image: users.image,
      },
    })
    .from(workflowShares)
    .innerJoin(workflows, eq(workflowShares.workflowId, workflows.id))
    .leftJoin(users, eq(workflowShares.ownerId, users.id))
    .where(eq(workflowShares.workflowId, workflowId))
    .limit(1);

  if (!row) return null;

  const isOwner = viewerId ? row.share.ownerId === viewerId : false;
  const [{ userCount }] = await db
    .select({ userCount: userCountExpr })
    .from(workflowLicenses)
    .where(eq(workflowLicenses.workflowId, row.share.workflowId));

  let hasLicense = false;
  if (viewerId && !isOwner) {
    const [match] = await db
      .select({ userId: workflowLicenses.userId })
      .from(workflowLicenses)
      .where(
        and(
          eq(workflowLicenses.workflowId, row.share.workflowId),
          eq(workflowLicenses.userId, viewerId),
        ),
      )
      .limit(1);
    hasLicense = Boolean(match);
  }

  return {
    workflowId: row.share.workflowId,
    shareId: row.share.id,
    workflowName: row.workflow.name,
    workflowDescription: row.workflow.description ?? null,
    summary: row.share.summary,
    priceInCredits: row.share.priceInCredits,
    tags: toStringArray(row.share.tags),
    userCount: Number(userCount ?? 0),
    owner: {
      id: row.share.ownerId,
      name: row.owner?.name ?? null,
      image: row.owner?.image ?? null,
    },
    createdAt: row.share.createdAt,
    updatedAt: row.share.updatedAt,
    viewerContext: viewerId
      ? {
          isOwner,
          hasLicense,
        }
      : undefined,
  };
};

export const createWorkflowShare = async (
  workflowId: string,
  ownerId: string,
  input: WorkflowShareFormValues,
): Promise<WorkflowShareDetail | null> => {
  const [workflow] = await db
    .select({ id: workflows.id, ownerId: workflows.ownerId })
    .from(workflows)
    .where(eq(workflows.id, workflowId))
    .limit(1);
  if (!workflow) throw new Error("워크플로우를 찾을 수 없습니다.");
  if (!workflow.ownerId || workflow.ownerId !== ownerId)
    throw new Error("해당 워크플로우를 공유할 권한이 없습니다.");

  const [existing] = await db
    .select({ id: workflowShares.id })
    .from(workflowShares)
    .where(eq(workflowShares.workflowId, workflowId))
    .limit(1);
  if (existing) throw new Error("이미 공유된 워크플로우입니다.");

  const [share] = await db
    .insert(workflowShares)
    .values({
      workflowId,
      ownerId,
      summary: input.summary,
      tags: input.tags && input.tags.length > 0 ? input.tags : null,
      priceInCredits: input.priceInCredits,
    })
    .returning();

  return getWorkflowShareDetail(share.workflowId, ownerId);
};
