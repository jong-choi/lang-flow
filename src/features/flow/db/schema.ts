import { relations } from "drizzle-orm";
import {
  doublePrecision,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "@/lib/db/schema";

// 워크플로우/노드/엣지 스키마
export const flowNodeTypeEnum = pgEnum("flow_node_type", [
  "inputNode",
  "outputNode",
  "chatNode",
  "searchNode",
  "messageNode",
  "singleInputMultiOutput",
  "multiInputSingleOutput",
]);

export const workflows = pgTable("workflows", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: text("owner_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
});

export const flowNodes = pgTable("flow_nodes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workflowId: text("workflow_id")
    .notNull()
    .references(() => workflows.id, { onDelete: "cascade" }),
  type: flowNodeTypeEnum("type").notNull(),
  // 위치 좌표
  posX: doublePrecision("pos_x").notNull().default(0),
  posY: doublePrecision("pos_y").notNull().default(0),
  // 노드 개별 데이터(JSON)
  // prettier-ignore
  data: jsonb("data").$type<Record<string, string | number | boolean | null | object>>(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
});

export const flowEdges = pgTable("flow_edges", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workflowId: text("workflow_id")
    .notNull()
    .references(() => workflows.id, { onDelete: "cascade" }),
  sourceId: text("source_id")
    .notNull()
    .references(() => flowNodes.id, { onDelete: "cascade" }),
  targetId: text("target_id")
    .notNull()
    .references(() => flowNodes.id, { onDelete: "cascade" }),
  sourceHandle: text("source_handle"),
  targetHandle: text("target_handle"),
  label: text("label"),
  order: integer("order"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
});

export const workflowLicenses = pgTable(
  "workflow_licenses",
  {
    workflowId: text("workflow_id")
      .notNull()
      .references(() => workflows.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.workflowId, table.userId] })],
);

// 릴레이션
export const workflowsRelations = relations(workflows, ({ many }) => ({
  nodes: many(flowNodes),
  edges: many(flowEdges),
  licenses: many(workflowLicenses),
}));

export const flowNodesRelations = relations(flowNodes, ({ one, many }) => ({
  workflow: one(workflows, {
    fields: [flowNodes.workflowId],
    references: [workflows.id],
  }),
  sourceForEdges: many(flowEdges, { relationName: "sourceNode" }),
  targetForEdges: many(flowEdges, { relationName: "targetNode" }),
}));

export const flowEdgesRelations = relations(flowEdges, ({ one }) => ({
  workflow: one(workflows, {
    fields: [flowEdges.workflowId],
    references: [workflows.id],
  }),
  source: one(flowNodes, {
    fields: [flowEdges.sourceId],
    references: [flowNodes.id],
    relationName: "sourceNode",
  }),
  target: one(flowNodes, {
    fields: [flowEdges.targetId],
    references: [flowNodes.id],
    relationName: "targetNode",
  }),
}));

export const workflowLicensesRelations = relations(
  workflowLicenses,
  ({ one }) => ({
    workflow: one(workflows, {
      fields: [workflowLicenses.workflowId],
      references: [workflows.id],
    }),
    user: one(users, {
      fields: [workflowLicenses.userId],
      references: [users.id],
    }),
  }),
);
