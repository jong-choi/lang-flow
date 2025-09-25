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
  uniqueIndex,
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

// 공유/라이선스 요청용 enum
export const workflowLicenseRequestStatusEnum = pgEnum(
  "workflow_license_status",
  ["pending", "approved", "rejected"],
);

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
  data: jsonb("data").$type<Record<string, string | number | boolean | null | Record<string, unknown>>>(),
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

// 워크플로우 공유(1:1) 테이블
export const workflowShares = pgTable(
  "workflow_shares",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    workflowId: text("workflow_id")
      .notNull()
      .references(() => workflows.id, { onDelete: "cascade" }),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    summary: text("summary").notNull(),
    tags: jsonb("tags").$type<string[] | null>(),
    priceInCredits: integer("price_in_credits").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("workflow_shares_workflow_unique").on(table.workflowId),
  ],
);

// 라이선스 요청(승인 전 상태 기록)
export const workflowLicenseRequests = pgTable(
  "workflow_license_requests",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    workflowId: text("workflow_id")
      .notNull()
      .references(() => workflows.id, { onDelete: "cascade" }),
    shareId: text("share_id")
      .notNull()
      .references(() => workflowShares.id, { onDelete: "cascade" }),
    requesterId: text("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: workflowLicenseRequestStatusEnum("status")
      .notNull()
      .default("pending"),
    message: text("message"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("workflow_license_requests_unique").on(
      table.shareId,
      table.requesterId,
    ),
  ],
);

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
export const workflowsRelations = relations(workflows, ({ many, one }) => ({
  nodes: many(flowNodes),
  edges: many(flowEdges),
  licenses: many(workflowLicenses),
  share: one(workflowShares, {
    fields: [workflows.id],
    references: [workflowShares.workflowId],
  }),
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

export const workflowSharesRelations = relations(
  workflowShares,
  ({ one, many }) => ({
    workflow: one(workflows, {
      fields: [workflowShares.workflowId],
      references: [workflows.id],
    }),
    owner: one(users, {
      fields: [workflowShares.ownerId],
      references: [users.id],
    }),
    licenseRequests: many(workflowLicenseRequests),
  }),
);

export const workflowLicenseRequestsRelations = relations(
  workflowLicenseRequests,
  ({ one }) => ({
    workflow: one(workflows, {
      fields: [workflowLicenseRequests.workflowId],
      references: [workflows.id],
    }),
    share: one(workflowShares, {
      fields: [workflowLicenseRequests.shareId],
      references: [workflowShares.id],
    }),
    requester: one(users, {
      fields: [workflowLicenseRequests.requesterId],
      references: [users.id],
    }),
  }),
);

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
