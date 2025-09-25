"use client";

import { MousePointer2 } from "lucide-react";

const tips = [
  {
    icon: MousePointer2,
    text: "사이드바에서 노드를 드래그하여 캔버스에 추가",
  },
] as const;

export const SidebarTipsCard = () => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
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
