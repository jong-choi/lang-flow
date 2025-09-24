"use client";

import { Save } from "lucide-react";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";
import { cn } from "@/utils/cn";

interface TemplateSaveButtonProps {
  label?: string;
  className?: string;
}

export const TemplateSaveButton = ({
  label = "템플릿으로 저장",
  className,
}: TemplateSaveButtonProps) => {
  const canRun = useFlowGeneratorStore.use.canRun();
  const runDisabledReason = useFlowGeneratorStore.use.runDisabledReason();
  const setTemplateModalOpen = useFlowGeneratorStore.use.setTemplateModalOpen();

  const disabled = !canRun;
  const title = disabled ? runDisabledReason ?? undefined : undefined;

  return (
    <button
      type="button"
      onClick={() => setTemplateModalOpen(true)}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-violet-200 px-3 py-1.5 text-sm font-semibold text-violet-600 hover:bg-violet-50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      disabled={disabled}
      title={title}
    >
      <Save className="size-4" /> {label}
    </button>
  );
};
