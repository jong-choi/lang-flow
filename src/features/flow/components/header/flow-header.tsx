"use client";

import type { ReactNode } from "react";
import { HeaderActions } from "@/features/flow/components/section/header/ui/header-actions";
import { WorkflowTitle } from "@/features/flow/components/section/header/ui/workflow-title";

export type FlowHeaderProps = {
  children?: ReactNode;
};

export function FlowHeader({ children }: FlowHeaderProps) {
  return (
    <header className="flex w-full items-center justify-between gap-3 border-b border-gray-100 bg-white/60 px-4 py-2 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <WorkflowTitle />
          <span className="text-xs text-gray-500">Workflow settings</span>
        </div>
      </div>

      <HeaderActions />

      {children}
    </header>
  );
}
