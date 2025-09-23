"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Save } from "lucide-react";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";
import { cn } from "@/utils/cn";

export type FlowHeaderProps = {
  name?: string;
  onDelete?: () => void;
  onSaveTemplate?: () => void;
  onNameChange?: (nextName: string) => void;
  children?: ReactNode;
};

export function FlowHeader({
  name = "untitled",
  onDelete,
  onSaveTemplate,
  onNameChange,
  children,
}: FlowHeaderProps) {
  const [editing, setEditing] = useState(false);
  const canRun = useFlowGeneratorStore.use.canRun();
  const runDisabledReason = useFlowGeneratorStore.use.runDisabledReason();
  const isTemplateDisabled = !canRun;

  return (
    <header className="w-full bg-white/60 backdrop-blur-sm border-b border-gray-100 px-4 py-2 flex items-center justify-between gap-3">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          {editing ? (
            <input
              aria-label="workflow-name"
              value={name}
              onChange={(event) => onNameChange?.(event.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setEditing(false);
                if (e.key === "Escape") setEditing(false);
              }}
              className="px-2 py-1 border rounded-md text-base font-semibold w-48"
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
          onClick={onSaveTemplate}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border border-violet-200 px-3 py-1.5 text-sm font-semibold text-violet-600 hover:bg-violet-50",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
          disabled={isTemplateDisabled}
          title={isTemplateDisabled ? runDisabledReason ?? undefined : undefined}
        >
          <Save className="size-4" /> 템플릿으로 저장
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-2.5 py-1.5 rounded-md hover:bg-gray-50 text-sm"
          data-testid="delete-btn"
        >
          삭제
        </button>
      </div>

      {children}
    </header>
  );
}
