"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { FlowCanvas } from "@/features/flow/components/section/flow/flow-canvas";
import { FlowPromptDialog } from "@/features/flow/components/section/flow/flow-prompt-dialog";
import { FlowRunToolbar } from "@/features/flow/components/section/flow/ui/flow-run-toolbar";
import { FlowSidebar } from "@/features/flow/components/sidebar/sidebar";

export const FlowSection = () => {
  return (
    <>
      <div className="flex min-h-0 flex-1">
        <FlowSidebar />
        <div className="flex flex-1 flex-col">
          <FlowRunToolbar />
          <ReactFlowProvider>
            <FlowCanvas />
          </ReactFlowProvider>
        </div>
      </div>
      <FlowPromptDialog />
    </>
  );
};

export const FlowBuilder = FlowSection;
