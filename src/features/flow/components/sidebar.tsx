"use client";

import type { ReactNode } from "react";
import { Hand, Info, Link2, MousePointer2, Trash2 } from "lucide-react";
import { SidebarNodePalette } from "@/features/flow/components/panel/sidebar-node-palette";
import { WorkflowPalette } from "@/features/flow/components/panel/workflow-palette";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";

const PaletteTab = ({
  view,
  currentView,
  onClick,
  children,
}: {
  view: "nodes" | "workflows";
  currentView: "nodes" | "workflows";
  onClick: (v: "nodes" | "workflows") => void;
  children: ReactNode;
}) => (
  <button
    className={`flex-1 rounded-md px-4 py-2 text-center text-sm font-semibold transition-colors ${
      currentView === view
        ? "bg-slate-900 text-white"
        : "bg-transparent text-slate-500 hover:bg-slate-100"
    }`}
    onClick={() => onClick(view)}
  >
    {children}
  </button>
);

export const Sidebar = () => {
  const active = useFlowGeneratorStore.use.paletteView();
  const setActive = useFlowGeneratorStore.use.setPaletteView();

  return (
    <aside className="flex h-full w-80 flex-col border-r border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* 상단 헤더 */}
      <div className="mb-4 shrink-0">
        <div className="flex rounded-lg bg-slate-200 p-1">
          <PaletteTab view="nodes" currentView={active} onClick={setActive}>
            노드
          </PaletteTab>
          <PaletteTab view="workflows" currentView={active} onClick={setActive}>
            워크플로우
          </PaletteTab>
        </div>
      </div>

      {/* 중간 영역 */}
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {active === "nodes" ? <SidebarNodePalette /> : <WorkflowPalette />}
      </div>

      {/* 하단 안내 */}
      <div className="mt-4 shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
          <Info className="size-4" /> 조작 방법
        </div>
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <li className="flex items-start gap-2">
            <MousePointer2 className="mt-0.5 size-4 text-violet-600" />
            <span>사이드바에서 노드를 드래그하여 캔버스에 추가</span>
          </li>
          <li className="flex items-start gap-2">
            <Link2 className="mt-0.5 size-4 text-violet-600" />
            <span>노드의 핸들을 드래그하여 다른 노드와 연결</span>
          </li>
          <li className="flex items-start gap-2">
            <Hand className="mt-0.5 size-4 text-violet-600" />
            <span>엣지를 드래그해 빈 공간에 놓으면 연결 해제</span>
          </li>
          <li className="flex items-start gap-2">
            <Link2 className="mt-0.5 size-4 text-violet-600" />
            <span>엣지를 다른 핸들로 드래그하면 재연결</span>
          </li>
          <li className="flex items-start gap-2">
            <Trash2 className="mt-0.5 size-4 text-violet-600" />
            <span>Delete 키로 선택한 노드/엣지 삭제</span>
          </li>
        </ul>
      </div>
    </aside>
  );
};
