"use client";

import { useCallback } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { BuilderHeader } from "@/features/flow/components/flow-builder/builder-header";
import { FlowCanvas } from "@/features/flow/components/flow-canvas";
import { PromptInputModal } from "@/features/flow/components/prompt-input-modal";
import { Sidebar } from "@/features/flow/components/sidebar";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";

export const FlowSection = () => {
  const activeTab = useFlowGeneratorStore.use.activeTab();
  const setActiveTab = useFlowGeneratorStore.use.setActiveTab();
  const requestRun = useFlowGeneratorStore.use.requestRun();
  const isPromptDialogOpen = useFlowGeneratorStore.use.promptDialog(
    (dialog) => dialog.isOpen,
  );
  const setPromptDialogOpen = useFlowGeneratorStore.use.setPromptDialogOpen();
  const onSubmitPrompt = useCallback(
    async (prompt: string) => {
      requestRun(prompt);
    },
    [requestRun],
  );
  const onRunComplete = useCallback(() => {
    setActiveTab("results");
  }, [setActiveTab]);

  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <BuilderHeader />

        {/* 캔버스/결과 */}
        <ReactFlowProvider>
          <FlowCanvas activeTab={activeTab} onRunComplete={onRunComplete} />
        </ReactFlowProvider>

        {/* 프롬프트 모달 */}
        <PromptInputModal
          open={isPromptDialogOpen}
          onOpenChange={setPromptDialogOpen}
          onSubmit={onSubmitPrompt}
        />
      </div>
    </div>
  );
};

export const FlowBuilder = FlowSection;
