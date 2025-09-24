import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { workflowLicenseRequests, workflowShares } from "@/lib/db/schema";

export type WorkflowShareRecord = InferSelectModel<typeof workflowShares>;
export type WorkflowShareInsert = InferInsertModel<typeof workflowShares>;
export type WorkflowLicenseRequestRecord = InferSelectModel<
  typeof workflowLicenseRequests
>;
export type WorkflowLicenseRequestInsert = InferInsertModel<
  typeof workflowLicenseRequests
>;

export interface WorkflowShareSummary {
  workflowId: string;
  shareId: string;
  workflowName: string;
  workflowDescription: string | null;
  summary: string;
  priceInCredits: number;
  tags: string[];
  licenseCount: number;
  owner: {
    id: string;
    name: string | null;
    image: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowShareDetail extends WorkflowShareSummary {
  viewerContext?: {
    isOwner: boolean;
    licenseStatus?: WorkflowLicenseRequestRecord["status"];
  };
}

export interface WorkflowShareFormInput {
  summary: string;
  tags?: string[];
  priceInCredits: number;
}

export interface WorkflowLicenseRequestInput {
  message?: string;
}
