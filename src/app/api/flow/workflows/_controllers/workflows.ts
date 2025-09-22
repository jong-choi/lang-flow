import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { flowEdges, flowNodes, workflows } from "@/features/flow/db/schema";
import { db } from "@/lib/db";

const workflowSelection = {
  id: workflows.id,
  name: workflows.name,
  description: workflows.description,
  ownerId: workflows.ownerId,
  createdAt: workflows.createdAt,
  updatedAt: workflows.updatedAt,
};

const nodeSelection = {
  id: flowNodes.id,
  workflowId: flowNodes.workflowId,
  type: flowNodes.type,
  posX: flowNodes.posX,
  posY: flowNodes.posY,
  data: flowNodes.data,
  createdAt: flowNodes.createdAt,
  updatedAt: flowNodes.updatedAt,
};

const edgeSelection = {
  id: flowEdges.id,
  workflowId: flowEdges.workflowId,
  sourceId: flowEdges.sourceId,
  targetId: flowEdges.targetId,
  sourceHandle: flowEdges.sourceHandle,
  targetHandle: flowEdges.targetHandle,
  label: flowEdges.label,
  order: flowEdges.order,
  createdAt: flowEdges.createdAt,
  updatedAt: flowEdges.updatedAt,
};

const workflowColumns = {
  id: true,
  name: true,
  description: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
};

const nodeColumns = {
  id: true,
  workflowId: true,
  type: true,
  posX: true,
  posY: true,
  data: true,
  createdAt: true,
  updatedAt: true,
};

const edgeColumns = {
  id: true,
  workflowId: true,
  sourceId: true,
  targetId: true,
  sourceHandle: true,
  targetHandle: true,
  label: true,
  order: true,
  createdAt: true,
  updatedAt: true,
};

function withUndefinedToNull<T>(value: T | undefined): T | null | undefined {
  if (value === undefined) return undefined;
  return (value ?? null) as T | null;
}

export async function listWorkflows({ ownerId }: { ownerId?: string | null }) {
  const condition = ownerId
    ? and(isNull(workflows.deletedAt), eq(workflows.ownerId, ownerId))
    : isNull(workflows.deletedAt);

  const rows = await db
    .select(workflowSelection)
    .from(workflows)
    .where(condition)
    .orderBy(desc(workflows.createdAt));

  return rows;
}

export async function createWorkflow(input: {
  name: string;
  description?: string | null;
  ownerId?: string | null;
  nodes?: Array<
    Omit<
      typeof flowNodes.$inferInsert,
      "workflowId" | "createdAt" | "updatedAt" | "deletedAt"
    >
  >;
  edges?: Array<
    Omit<
      typeof flowEdges.$inferInsert,
      "workflowId" | "createdAt" | "updatedAt" | "deletedAt"
    >
  >;
}) {
  return db.transaction(async (transaction) => {
    const [created] = await transaction
      .insert(workflows)
      .values({
        name: input.name,
        description: withUndefinedToNull(input.description) ?? null,
        ownerId: withUndefinedToNull(input.ownerId) ?? null,
      })
      .returning(workflowSelection);

    if (!created) {
      throw new Error("워크플로우 생성에 실패했습니다.");
    }

    if (input.nodes && input.nodes.length > 0) {
      await transaction.insert(flowNodes).values(
        input.nodes.map((node) => ({
          ...node,
          workflowId: created.id,
        })),
      );
    }

    if (input.edges && input.edges.length > 0) {
      await transaction.insert(flowEdges).values(
        input.edges.map((edge) => ({
          ...edge,
          workflowId: created.id,
        })),
      );
    }

    const nodes = await transaction
      .select(nodeSelection)
      .from(flowNodes)
      .where(
        and(eq(flowNodes.workflowId, created.id), isNull(flowNodes.deletedAt)),
      );

    const edges = await transaction
      .select(edgeSelection)
      .from(flowEdges)
      .where(
        and(eq(flowEdges.workflowId, created.id), isNull(flowEdges.deletedAt)),
      );

    return { ...created, nodes, edges };
  });
}

export async function getWorkflowById(id: string) {
  const workflow = await db.query.workflows.findFirst({
    where: (workflow, { eq, and, isNull }) =>
      and(eq(workflow.id, id), isNull(workflow.deletedAt)),
    columns: workflowColumns,
    with: {
      nodes: {
        columns: nodeColumns,
        where: (node, { isNull, eq }) =>
          and(eq(node.workflowId, id), isNull(node.deletedAt)),
      },
      edges: {
        columns: edgeColumns,
        where: (edge, { isNull, eq }) =>
          and(eq(edge.workflowId, id), isNull(edge.deletedAt)),
      },
    },
  });

  if (!workflow) {
    return null;
  }

  return workflow;
}

export async function updateWorkflow(
  id: string,
  input: {
    name?: string;
    description?: string | null;
    ownerId?: string | null;
    nodes?: Array<
      Omit<
        typeof flowNodes.$inferInsert,
        "workflowId" | "createdAt" | "updatedAt" | "deletedAt"
      >
    >;
    edges?: Array<
      Omit<
        typeof flowEdges.$inferInsert,
        "workflowId" | "createdAt" | "updatedAt" | "deletedAt"
      >
    >;
  },
) {
  return db.transaction(async (transaction) => {
    const [existing] = await transaction
      .select({ id: workflows.id })
      .from(workflows)
      .where(and(eq(workflows.id, id), isNull(workflows.deletedAt)))
      .limit(1);

    if (!existing) {
      return null;
    }

    const updateData: Partial<typeof workflows.$inferInsert> = {};

    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    if (input.description !== undefined) {
      updateData.description = withUndefinedToNull(input.description) ?? null;
    }

    if (input.ownerId !== undefined) {
      updateData.ownerId = withUndefinedToNull(input.ownerId) ?? null;
    }

    if (Object.keys(updateData).length > 0) {
      await transaction
        .update(workflows)
        .set({ ...updateData, updatedAt: sql`now()` })
        .where(eq(workflows.id, id));
    }

    if (input.edges !== undefined) {
      const existingEdges = await transaction
        .select({ id: flowEdges.id })
        .from(flowEdges)
        .where(and(eq(flowEdges.workflowId, id), isNull(flowEdges.deletedAt)));

      const existingEdgeIds = new Set(existingEdges.map((edge) => edge.id));
      const inputEdgeIds = new Set(
        input.edges.map((edge) => edge.id).filter(Boolean),
      );

      const edgesToDelete = existingEdges.filter(
        (edge) => !inputEdgeIds.has(edge.id),
      );
      if (edgesToDelete.length > 0) {
        await transaction
          .update(flowEdges)
          .set({ deletedAt: new Date(), updatedAt: sql`now()` })
          .where(
            inArray(
              flowEdges.id,
              edgesToDelete.map((edge) => edge.id),
            ),
          );
      }

      // 생성/업데이트할 엣지들 처리
      for (const edge of input.edges) {
        if (edge.id && existingEdgeIds.has(edge.id)) {
          // 기존 엣지 업데이트
          await transaction
            .update(flowEdges)
            .set({
              sourceId: edge.sourceId,
              targetId: edge.targetId,
              sourceHandle: edge.sourceHandle,
              targetHandle: edge.targetHandle,
              label: edge.label,
              order: edge.order,
              updatedAt: sql`now()`,
            })
            .where(eq(flowEdges.id, edge.id));
        } else {
          await transaction.insert(flowEdges).values({
            ...edge,
            workflowId: id,
          });
        }
      }
    }

    if (input.nodes !== undefined) {
      const existingNodes = await transaction
        .select({ id: flowNodes.id })
        .from(flowNodes)
        .where(and(eq(flowNodes.workflowId, id), isNull(flowNodes.deletedAt)));

      const existingNodeIds = new Set(existingNodes.map((node) => node.id));
      const inputNodeIds = new Set(
        input.nodes.map((node) => node.id).filter(Boolean),
      );

      const nodesToDelete = existingNodes.filter(
        (node) => !inputNodeIds.has(node.id),
      );
      if (nodesToDelete.length > 0) {
        await transaction
          .update(flowNodes)
          .set({ deletedAt: new Date(), updatedAt: sql`now()` })
          .where(
            inArray(
              flowNodes.id,
              nodesToDelete.map((node) => node.id),
            ),
          );
      }

      for (const node of input.nodes) {
        if (node.id && existingNodeIds.has(node.id)) {
          await transaction
            .update(flowNodes)
            .set({
              type: node.type,
              posX: node.posX,
              posY: node.posY,
              data: node.data,
              updatedAt: sql`now()`,
            })
            .where(eq(flowNodes.id, node.id));
        } else {
          await transaction.insert(flowNodes).values({
            ...node,
            workflowId: id,
          });
        }
      }
    }

    const updated = await transaction.query.workflows.findFirst({
      where: (workflow, { eq, and, isNull }) =>
        and(eq(workflow.id, id), isNull(workflow.deletedAt)),
      columns: workflowColumns,
      with: {
        nodes: {
          columns: nodeColumns,
          where: (node, { isNull, eq }) =>
            and(eq(node.workflowId, id), isNull(node.deletedAt)),
        },
        edges: {
          columns: edgeColumns,
          where: (edge, { isNull, eq }) =>
            and(eq(edge.workflowId, id), isNull(edge.deletedAt)),
        },
      },
    });

    return updated;
  });
}

export async function deleteWorkflow(id: string) {
  return db.transaction(async (transaction) => {
    const [existing] = await transaction
      .select({ id: workflows.id })
      .from(workflows)
      .where(and(eq(workflows.id, id), isNull(workflows.deletedAt)))
      .limit(1);

    if (!existing) {
      return false;
    }

    const deletedAt = new Date();

    await transaction
      .update(workflows)
      .set({ deletedAt, updatedAt: sql`now()` })
      .where(eq(workflows.id, id));

    await transaction
      .update(flowNodes)
      .set({ deletedAt, updatedAt: sql`now()` })
      .where(eq(flowNodes.workflowId, id));

    await transaction
      .update(flowEdges)
      .set({ deletedAt, updatedAt: sql`now()` })
      .where(eq(flowEdges.workflowId, id));

    return true;
  });
}
