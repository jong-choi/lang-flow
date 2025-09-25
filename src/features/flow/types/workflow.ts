import type { InferSelectModel } from "drizzle-orm";
import type { workflows } from "@/features/flow/db/schema";
import type { SchemaEdge, SchemaNode } from "@/features/flow/types/graph";

export type WorkflowRow = InferSelectModel<typeof workflows>;

export type WorkflowOwnership = "owner" | "licensed";

export interface WorkflowSummary {
  id: WorkflowRow["id"];
  name: WorkflowRow["name"];
  description: WorkflowRow["description"];
  updatedAt?: WorkflowRow["updatedAt"] | null;
  ownership: WorkflowOwnership;
  isOwner: boolean;
  isLicensed: boolean;
}

export interface WorkflowDetail extends WorkflowSummary {
  nodes: SchemaNode[];
  edges: SchemaEdge[];
}
