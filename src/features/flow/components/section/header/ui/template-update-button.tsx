"use client";

import { useCallback, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";
import {
  deserializeWorkflowDetail,
  serializeEdgeForApi,
  serializeNodeForApi,
  toWorkflowSummary,
} from "@/features/flow/utils/workflow-transformers";
import { cn } from "@/utils/cn";

interface TemplateUpdateButtonProps {
  workflowId: string;
  disabled?: boolean;
}

export const TemplateUpdateButton = ({
  workflowId,
  disabled: disabledProp = false,
}: TemplateUpdateButtonProps) => {
  const canRun = useFlowGeneratorStore.use.canRun();
  const runDisabledReason = useFlowGeneratorStore.use.runDisabledReason();
  const workflowName = useFlowGeneratorStore.use.workflowName();
  const canvasNodes = useFlowGeneratorStore.use.canvasNodes();
  const canvasEdges = useFlowGeneratorStore.use.canvasEdges();
  const cacheTemplateDetail = useFlowGeneratorStore.use.cacheTemplateDetail();
  const upsertTemplate = useFlowGeneratorStore.use.upsertTemplate();
  const fetchTemplates = useFlowGeneratorStore.use.fetchTemplates();
  const [isUpdating, setIsUpdating] = useState(false);

  const disabled = disabledProp || !canRun || isUpdating;
  const title = !canRun ? (runDisabledReason ?? undefined) : undefined;

  const handleUpdate = useCallback(async () => {
    if (disabled) return;
    const normalizedName = workflowName?.trim();
    if (!normalizedName) {
      toast.error("워크플로우 이름을 입력해주세요.");
      return;
    }

    if (canvasNodes.length === 0) {
      toast.error("캔버스에 노드가 없습니다.");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: normalizedName,
          nodes: canvasNodes.map(serializeNodeForApi),
          edges: canvasEdges.map(serializeEdgeForApi),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        toast.error(payload?.message ?? "워크플로우 업데이트에 실패했습니다.");
        return;
      }

      const payload = await response.json();
      const detail = deserializeWorkflowDetail(payload.workflow);
      cacheTemplateDetail(detail);
      upsertTemplate(toWorkflowSummary(payload.workflow));
      toast.success("워크플로우가 업데이트되었습니다.");
      void fetchTemplates();
    } catch (error) {
      console.error("워크플로우 업데이트 실패", error);
      toast.error("워크플로우 업데이트에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  }, [
    cacheTemplateDetail,
    canvasEdges,
    canvasNodes,
    disabled,
    fetchTemplates,
    upsertTemplate,
    workflowId,
    workflowName,
  ]);

  return (
    <button
      type="button"
      onClick={handleUpdate}
      className={cn(
        "inline-flex items-center gap-2 rounded-md bg-violet-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-violet-700",
        "disabled:cursor-not-allowed disabled:opacity-60",
      )}
      disabled={disabled}
      title={title}
    >
      {isUpdating ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <RefreshCw className="size-4" />
      )}
      업데이트
    </button>
  );
};
