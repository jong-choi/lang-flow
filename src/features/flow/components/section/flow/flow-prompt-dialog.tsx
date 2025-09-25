"use client";

import { useCallback } from "react";
import { PromptInputModal } from "@/features/flow/components/ui/prompt-input-modal";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";

export const FlowPromptDialog = () => {
  const isOpen = useFlowGeneratorStore.use.promptDialog((dialog) => dialog.isOpen);
  const setOpen = useFlowGeneratorStore.use.setPromptDialogOpen();
  const requestRun = useFlowGeneratorStore.use.requestRun();

  const handleSubmit = useCallback(
    async (prompt: string) => {
      requestRun(prompt);
    },
    [requestRun],
  );

  return (
    <PromptInputModal
      open={isOpen}
      onOpenChange={setOpen}
      onSubmit={handleSubmit}
    />
  );
};
