import type { WorkflowSummary } from "@/features/flow/types/workflow";

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
  templates: WorkflowSummary[],
  query: string,
): WorkflowSummary[] => {
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

export const shouldFetchTemplates = (templates: WorkflowSummary[]): boolean =>
  templates.length === 0;

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
