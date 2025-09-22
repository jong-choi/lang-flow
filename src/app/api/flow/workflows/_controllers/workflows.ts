import { and, desc, eq, inArray, isNull, or, sql } from "drizzle-orm";
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

const workflowColumns = Object.fromEntries(
  Object.keys(workflowSelection).map((key) => [key, true]),
) as Record<keyof typeof workflowSelection, true>;

const nodeColumns = Object.fromEntries(
  Object.keys(nodeSelection).map((key) => [key, true]),
) as Record<keyof typeof nodeSelection, true>;

const edgeColumns = Object.fromEntries(
  Object.keys(edgeSelection).map((key) => [key, true]),
) as Record<keyof typeof edgeSelection, true>;

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

    const nodes =
      input.nodes && input.nodes.length > 0
        ? await transaction
            .insert(flowNodes)
            .values(
              input.nodes.map((node) => ({
                ...node,
                workflowId: created.id,
              })),
            )
            .returning(nodeSelection)
        : [];

    const edges =
      input.edges && input.edges.length > 0
        ? await transaction
            .insert(flowEdges)
            .values(
              input.edges.map((edge) => ({
                ...edge,
                workflowId: created.id,
              })),
            )
            .returning(edgeSelection)
        : [];

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
    // 중복되는 노드/엣지 동기화 로직을 헬퍼로 추출
    const syncEdges = async (
      edgesInput: Array<
        Omit<
          typeof flowEdges.$inferInsert,
          "workflowId" | "createdAt" | "updatedAt" | "deletedAt"
        >
      >,
    ) => {
      const existingEdges = await transaction
        .select({ id: flowEdges.id })
        .from(flowEdges)
        .where(and(eq(flowEdges.workflowId, id), isNull(flowEdges.deletedAt)));

      const inputEdgeIds = new Set(
        edgesInput.map((edge) => edge.id).filter(Boolean) as string[],
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

      if (edgesInput.length > 0) {
        await transaction
          .insert(flowEdges)
          .values(edgesInput.map((edge) => ({ ...edge, workflowId: id })))
          .onConflictDoUpdate({
            target: flowEdges.id,
            set: {
              sourceId: sql`excluded.source_id`,
              targetId: sql`excluded.target_id`,
              sourceHandle: sql`excluded.source_handle`,
              targetHandle: sql`excluded.target_handle`,
              label: sql`excluded.label`,
              order: sql`excluded.order`,
              updatedAt: sql`now()`,
            },
          });
      }
    };

    const syncNodes = async (
      nodesInput: Array<
        Omit<
          typeof flowNodes.$inferInsert,
          "workflowId" | "createdAt" | "updatedAt" | "deletedAt"
        >
      >,
    ) => {
      const existingNodes = await transaction
        .select({ id: flowNodes.id })
        .from(flowNodes)
        .where(and(eq(flowNodes.workflowId, id), isNull(flowNodes.deletedAt)));

      const inputNodeIds = new Set(
        nodesInput.map((node) => node.id).filter(Boolean) as string[],
      );

      const nodesToDelete = existingNodes.filter(
        (node) => !inputNodeIds.has(node.id),
      );
      if (nodesToDelete.length > 0) {
        const nodesToDeleteIds = nodesToDelete.map((node) => node.id);
        await transaction
          .update(flowNodes)
          .set({ deletedAt: new Date(), updatedAt: sql`now()` })
          .where(inArray(flowNodes.id, nodesToDeleteIds));

        await transaction
          .update(flowEdges)
          .set({ deletedAt: new Date(), updatedAt: sql`now()` })
          .where(
            or(
              inArray(flowEdges.sourceId, nodesToDeleteIds),
              inArray(flowEdges.targetId, nodesToDeleteIds),
            ),
          );
      }

      if (nodesInput.length > 0) {
        await transaction
          .insert(flowNodes)
          .values(nodesInput.map((node) => ({ ...node, workflowId: id })))
          .onConflictDoUpdate({
            target: flowNodes.id,
            set: {
              type: sql`excluded.type`,
              posX: sql`excluded.pos_x`,
              posY: sql`excluded.pos_y`,
              data: sql`excluded.data`,
              updatedAt: sql`now()`,
            },
          });
      }
    };

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

    if (input.nodes !== undefined) {
      await syncNodes(input.nodes);
    }

    if (input.edges !== undefined) {
      await syncEdges(input.edges);
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
