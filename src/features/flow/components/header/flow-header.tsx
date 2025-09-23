"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";
import { cn } from "@/utils/cn";

export type FlowHeaderProps = {
  children?: ReactNode;
};

export function FlowHeader({ children }: FlowHeaderProps) {
  const [editing, setEditing] = useState(false);
  const workflowName = useFlowGeneratorStore.use.workflowName();
  const setWorkflowName = useFlowGeneratorStore.use.setWorkflowName();
  const name = workflowName ?? "새 템플릿";
  const canRun = useFlowGeneratorStore.use.canRun();
  const runDisabledReason = useFlowGeneratorStore.use.runDisabledReason();
  const setTemplateModalOpen = useFlowGeneratorStore.use.setTemplateModalOpen();
  const isTemplateDisabled = !canRun;

  return (
    <header className="flex w-full items-center justify-between gap-3 border-b border-gray-100 bg-white/60 px-4 py-2 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          {editing ? (
            <input
              aria-label="workflow-name"
              value={name}
              onChange={(event) => setWorkflowName(event.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setEditing(false);
                if (e.key === "Escape") setEditing(false);
              }}
              className="w-48 rounded-md border px-2 py-1 text-base font-semibold"
              data-testid="flow-name-input"
            />
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-base font-semibold text-gray-900 hover:underline"
              data-testid="flow-name-button"
            >
              {name}
            </button>
          )}
          <span className="text-xs text-gray-500">Workflow settings</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setTemplateModalOpen(true)}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border border-violet-200 px-3 py-1.5 text-sm font-semibold text-violet-600 hover:bg-violet-50",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
          disabled={isTemplateDisabled}
          title={
            isTemplateDisabled ? (runDisabledReason ?? undefined) : undefined
          }
        >
          <Save className="size-4" /> 템플릿으로 저장
        </button>

        <button
          type="button"
          onClick={() => toast.error("삭제기능 미구현")}
          className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          data-testid="delete-btn"
        >
          삭제
        </button>
      </div>

      {children}
    </header>
  );
}
