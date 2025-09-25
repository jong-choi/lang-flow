import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { flowEdges, flowNodes, workflows } from "@/features/flow/db/schema";
import type { FlowEdgeInsert, FlowNodeInsert } from "@/features/flow/types/graph";
import type { WorkflowOwnership, WorkflowRow } from "@/features/flow/types/workflow";

const nodeDataValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.record(z.string(), z.unknown()),
]);

const nodeDataSchema = z
  .record(z.string(), nodeDataValueSchema)
  .optional()
  .nullable();

const nodeInsertSchema = createInsertSchema(flowNodes, {
  posX: (schema) => schema.optional(),
  posY: (schema) => schema.optional(),
  data: () => nodeDataSchema,
});

export const workflowNodePayloadSchema = nodeInsertSchema
  .pick({
    id: true,
    type: true,
    posX: true,
    posY: true,
    data: true,
  })
  .extend({
    id: nodeInsertSchema.shape.id.optional(),
  });

const edgeInsertSchema = createInsertSchema(flowEdges, {
  order: (schema) => schema.optional(),
});

export const workflowEdgePayloadSchema = edgeInsertSchema
  .pick({
    id: true,
    sourceId: true,
    targetId: true,
    sourceHandle: true,
    targetHandle: true,
    label: true,
    order: true,
  })
  .extend({
    id: edgeInsertSchema.shape.id.optional(),
    sourceHandle: edgeInsertSchema.shape.sourceHandle.optional().nullable(),
    targetHandle: edgeInsertSchema.shape.targetHandle.optional().nullable(),
    label: edgeInsertSchema.shape.label.optional().nullable(),
    order: edgeInsertSchema.shape.order.optional().nullable(),
  });

const workflowUpdateFieldsSchema = createInsertSchema(workflows, {
  name: (schema) => schema.min(1),
  description: (schema) => schema.optional().nullable(),
}).pick({ name: true, description: true });

export const workflowMetadataSchema = workflowUpdateFieldsSchema;

export const updateWorkflowSchema = workflowMetadataSchema.partial().extend({
  nodes: z.array(workflowNodePayloadSchema).optional(),
  edges: z.array(workflowEdgePayloadSchema).optional(),
});

export type WorkflowApiNode = z.infer<typeof workflowNodePayloadSchema>;
export type WorkflowApiEdge = z.infer<typeof workflowEdgePayloadSchema>;
export type UpdateWorkflowPayload = z.infer<typeof updateWorkflowSchema>;

export interface WorkflowApiDetail
  extends Pick<WorkflowRow, "id" | "name" | "description" | "updatedAt"> {
  ownership?: WorkflowOwnership;
  isOwner?: boolean;
  isLicensed?: boolean;
  nodes?: WorkflowApiNode[];
  edges?: WorkflowApiEdge[];
}

export type WorkflowNodeInsert = FlowNodeInsert;
export type WorkflowEdgeInsert = FlowEdgeInsert;
