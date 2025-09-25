"use client";

import { PaletteTabButton } from "@/features/flow/components/sidebar/ui/palette-tab-button";
import { SidebarTipsCard } from "@/features/flow/components/sidebar/ui/sidebar-tips-card";
import { SidebarNodePalette } from "@/features/flow/components/sidebar/ui/node-palette";
import { WorkflowPalette } from "@/features/flow/components/sidebar/ui/workflow-palette";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";

type PaletteView = "nodes" | "workflows";

export const FlowSidebar = () => {
  const activeView = useFlowGeneratorStore.use.paletteView();
  const setActiveView = useFlowGeneratorStore.use.setPaletteView();

  const handleSelect = (view: PaletteView) => {
    setActiveView(view);
  };

  return (
    <aside className="flex h-full w-80 flex-col border-r border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-4 shrink-0">
        <div className="flex rounded-lg bg-slate-200 p-1">
          <PaletteTabButton
            view="nodes"
            isActive={activeView === "nodes"}
            onSelect={handleSelect}
          >
            노드
          </PaletteTabButton>
          <PaletteTabButton
            view="workflows"
            isActive={activeView === "workflows"}
            onSelect={handleSelect}
          >
            워크플로우
          </PaletteTabButton>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {activeView === "nodes" ? <SidebarNodePalette /> : <WorkflowPalette />}
      </div>

      <SidebarTipsCard />
    </aside>
  );
};
