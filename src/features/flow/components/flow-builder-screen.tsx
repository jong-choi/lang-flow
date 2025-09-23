"use client";

import { FlowSection } from "@/features/flow/components/flow-section";
import { FlowHeader } from "@/features/flow/components/header/flow-header";
import { TemplateMoveDialog } from "@/features/flow/components/template-move-dialog";
import { TemplateSaveDialog } from "@/features/flow/components/template-save-dialog";

export const FlowBuilderScreen = () => {
  return (
    <div className="flex flex-col h-screen">
      <FlowHeader />
      <FlowSection />
      <TemplateSaveDialog />
      <TemplateMoveDialog />
    </div>
  );
};
