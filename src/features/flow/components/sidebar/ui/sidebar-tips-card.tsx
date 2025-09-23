"use client";

import { Hand, Info, Link2, MousePointer2, Trash2 } from "lucide-react";

const tips = [
  {
    icon: MousePointer2,
    text: "사이드바에서 노드를 드래그하여 캔버스에 추가",
  },
  {
    icon: Link2,
    text: "노드의 핸들을 드래그하여 다른 노드와 연결",
  },
  {
    icon: Hand,
    text: "엣지를 드래그해 빈 공간에 놓으면 연결 해제",
  },
  {
    icon: Link2,
    text: "엣지를 다른 핸들로 드래그하면 재연결",
  },
  {
    icon: Trash2,
    text: "Delete 키로 선택한 노드/엣지 삭제",
  },
] as const;

export const SidebarTipsCard = () => {
  return (
    <div className="mt-4 shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
        <Info className="size-4" /> 조작 방법
      </div>
      <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
        {tips.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-2">
            <Icon className="mt-0.5 size-4 text-violet-600" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
