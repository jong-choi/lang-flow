"use client";

import { SidebarNodePalette } from "@/features/flow/components/sidebar/ui/node-palette";
import { PaletteTabButton } from "@/features/flow/components/sidebar/ui/palette-tab-button";
import { SidebarTipsCard } from "@/features/flow/components/sidebar/ui/sidebar-tips-card";
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
    <aside className="flex min-h-0 w-80 flex-col border-r border-slate-200 bg-white py-2 dark:border-slate-800 dark:bg-slate-950">
      <div className="z-10 shrink-0 px-4 pb-2">
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

      <div className="min-h-0 flex-1 basis-0 overflow-y-auto px-4 py-2">
        {activeView === "nodes" ? <SidebarNodePalette /> : <WorkflowPalette />}
      </div>

      <div className="mt-4 shrink-0 px-4">
        <SidebarTipsCard />
      </div>
    </aside>
  );
};
