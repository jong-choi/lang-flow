import { and, desc, eq, sql } from "drizzle-orm";
import {
  workflowLicenseRequests,
  workflowShares,
  workflows,
} from "@/features/flow/db/schema";
import type {
  WorkflowLicenseRequest,
  WorkflowLicenseRequestFormValues,
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

const licenseCountExpr = sql<number>`coalesce(count(distinct ${workflowLicenseRequests.id}), 0)`;

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
      licenseCount: licenseCountExpr,
    })
    .from(workflowShares)
    .innerJoin(workflows, eq(workflowShares.workflowId, workflows.id))
    .leftJoin(users, eq(workflowShares.ownerId, users.id))
    .leftJoin(
      workflowLicenseRequests,
      eq(workflowLicenseRequests.shareId, workflowShares.id),
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
    licenseCount: Number(row.licenseCount ?? 0),
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
  const [{ licenseCount }] = await db
    .select({ licenseCount: licenseCountExpr })
    .from(workflowLicenseRequests)
    .where(eq(workflowLicenseRequests.shareId, row.share.id));

  let viewerRequest: WorkflowLicenseRequest | undefined;
  if (viewerId && !isOwner) {
    const [match] = await db
      .select()
      .from(workflowLicenseRequests)
      .where(
        and(
          eq(workflowLicenseRequests.shareId, row.share.id),
          eq(workflowLicenseRequests.requesterId, viewerId),
        ),
      )
      .limit(1);
    viewerRequest = match;
  }

  return {
    workflowId: row.share.workflowId,
    shareId: row.share.id,
    workflowName: row.workflow.name,
    workflowDescription: row.workflow.description ?? null,
    summary: row.share.summary,
    priceInCredits: row.share.priceInCredits,
    tags: toStringArray(row.share.tags),
    licenseCount: Number(licenseCount ?? 0),
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
          licenseStatus: viewerRequest?.status,
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

export const requestWorkflowLicense = async (
  workflowId: string,
  requesterId: string,
  input: WorkflowLicenseRequestFormValues = {},
) => {
  const [share] = await db
    .select()
    .from(workflowShares)
    .where(eq(workflowShares.workflowId, workflowId))
    .limit(1);
  if (!share) throw new Error("공유된 워크플로우가 존재하지 않습니다.");
  if (share.ownerId === requesterId)
    throw new Error("내 워크플로우는 라이선스가 필요하지 않습니다.");

  const [existing] = await db
    .select()
    .from(workflowLicenseRequests)
    .where(
      and(
        eq(workflowLicenseRequests.shareId, share.id),
        eq(workflowLicenseRequests.requesterId, requesterId),
      ),
    )
    .limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(workflowLicenseRequests)
    .values({
      workflowId,
      shareId: share.id,
      requesterId,
      status: "pending",
      message: input.message ?? null,
    })
    .returning();

  return created;
};
