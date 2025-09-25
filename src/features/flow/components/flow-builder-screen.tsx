"use client";

import { FlowHeader } from "@/features/flow/components/header/flow-header";
import { FlowSection } from "@/features/flow/components/section/flow/flow-section";
import { TemplateMoveDialog } from "@/features/flow/components/ui/template-move-dialog";
import { TemplateSaveDialog } from "@/features/flow/components/ui/template-save-dialog";

export const FlowBuilderScreen = () => {
  return (
    <div className="flex h-screen flex-col">
      <FlowHeader />
      <FlowSection />
      <TemplateSaveDialog />
      <TemplateMoveDialog />
    </div>
  );
};
