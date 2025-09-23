import type { WorkflowTemplateSummary } from "@/features/flow/types/nodes";

interface RunEligibilityState {
  ok: boolean;
  reason: string | null;
}

interface RunGateParams {
  runEligibility: RunEligibilityState;
  isRunning: boolean;
  error: unknown;
  failedNodeIds: Set<string>;
}

export interface RunGateState {
  canRun: boolean;
  runDisabledReason: string | null;
  canRetry: boolean;
}

export const filterTemplatesByQuery = (
  templates: WorkflowTemplateSummary[],
  query: string,
): WorkflowTemplateSummary[] => {
  const keyword = query.trim().toLowerCase();

  if (!keyword) {
    return templates;
  }

  return templates.filter((template) => {
    const description = template.description ?? "";

    return (
      template.name.toLowerCase().includes(keyword) ||
      description.toLowerCase().includes(keyword)
    );
  });
};

export const shouldFetchTemplates = (
  templates: WorkflowTemplateSummary[],
): boolean => templates.length === 0;

export const createRunGateState = ({
  runEligibility,
  isRunning,
  error,
  failedNodeIds,
}: RunGateParams): RunGateState => ({
  canRun: runEligibility.ok && !isRunning,
  runDisabledReason: runEligibility.ok ? null : runEligibility.reason,
  canRetry: Boolean(error) || failedNodeIds.size > 0,
});
