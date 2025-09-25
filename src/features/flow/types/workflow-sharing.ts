import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import {
  workflowLicenseRequests,
  workflowShares,
} from "@/features/flow/db/schema";

export type WorkflowShare = InferSelectModel<typeof workflowShares>;

type WorkflowLicenseRequestInsert = InferInsertModel<
  typeof workflowLicenseRequests
>;
export type WorkflowLicenseRequest = InferSelectModel<
  typeof workflowLicenseRequests
>;

export type WorkflowLicenseRequestStatus = WorkflowLicenseRequest["status"];

const shareInsertSchema = createInsertSchema(workflowShares, {
  workflowId: (schema) => schema.min(1, "워크플로우 ID가 필요합니다."),
  summary: (schema) => schema.min(1, "한 줄 소개를 입력해주세요.").max(160),
  priceInCredits: (schema) => schema.min(0).max(1_000_000),
});

const rawTagsSchema = z
  .array(z.string())
  .optional()
  .refine(
    (value) => !value || value.length <= 10,
    "최대 10개까지 입력할 수 있습니다.",
  );

const shareFormSchema = shareInsertSchema
  .pick({ summary: true, priceInCredits: true })
  .extend({
    workflowId: shareInsertSchema.shape.workflowId,
    tags: rawTagsSchema.refine(
      (value) => !value || value.length <= 10,
      "최대 10개까지 입력할 수 있습니다.",
    ),
  });

// 최종 스키마 = 변환 없이 그대로 사용
export const workflowShareFormSchema = shareFormSchema;

const licenseRequestInsertSchema = createInsertSchema(workflowLicenseRequests, {
  message: (schema) => schema.max(500).optional().nullable(),
});

export const workflowLicenseRequestSchema = z
  .object({
    message: licenseRequestInsertSchema.shape.message.optional().nullable(),
  })
  .transform((value) => ({
    message: value.message ?? undefined,
  })) satisfies z.ZodType<WorkflowLicenseRequestFormValues>;

export type WorkflowShareFormValues = z.infer<typeof workflowShareFormSchema>;

export type WorkflowLicenseRequestFormValues = {
  message?: WorkflowLicenseRequestInsert["message"];
};

export interface WorkflowShareOwner {
  id: string;
  name: string | null;
  image: string | null;
}

export interface WorkflowShareSummary {
  workflowId: string;
  shareId: string;
  workflowName: string;
  workflowDescription: string | null;
  summary: string;
  priceInCredits: number;
  tags: string[];
  licenseCount: number;
  owner: WorkflowShareOwner;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowShareViewerContext {
  isOwner: boolean;
  licenseStatus?: WorkflowLicenseRequestStatus;
}

export interface WorkflowShareDetail extends WorkflowShareSummary {
  viewerContext?: WorkflowShareViewerContext;
}
