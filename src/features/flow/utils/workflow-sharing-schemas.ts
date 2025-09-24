import { z } from "zod";
const baseStringList = z.union([
  z.array(z.string().min(1)),
  z
    .string()
    .transform((value) =>
      value
        .split(/[\,\n]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
]);

const stringList = (limit: number) =>
  baseStringList
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      const normalized = value
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
      return normalized.length > 0 ? normalized : undefined;
    })
    .refine(
      (value) => !value || value.length <= limit,
      `최대 ${limit}개까지 입력할 수 있습니다.`,
    );

export const workflowShareFormSchema = z.object({
  workflowId: z.string().min(1, "워크플로우 ID가 필요합니다."),
  summary: z.string().min(1, "한 줄 소개를 입력해주세요.").max(160),
  tags: stringList(10),
  priceInCredits: z.coerce.number().int().min(0).max(1000000),
});

export type WorkflowShareFormSchema = z.infer<typeof workflowShareFormSchema>;

export const workflowLicenseRequestSchema = z.object({
  message: z.string().max(500).optional().nullable(),
});

export type WorkflowLicenseRequestSchema = z.infer<
  typeof workflowLicenseRequestSchema
>;
