"use client";

/**
 * 자식 슬롯으로 패널을 받고, 하단에 사용자 가이드를 제공한다.
 */
import type { ReactNode } from "react";

export const Sidebar = ({ children }: { children: ReactNode }) => (
  <aside className="w-80 bg-gradient-to-b from-slate-50 to-violet-50 border-r border-violet-200 p-6 h-full overflow-y-auto">
    <div className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
      <span className="text-2xl">🎨</span>
      드래그하여 노드 추가
    </div>
    {children}
    <div className="mt-8 p-4 bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-xl">
      <div className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-xl">📝</span>
        조작 방법
      </div>
      <div className="space-y-3 text-sm text-gray-700">
        <div className="flex items-start gap-2">
          <span className="text-violet-500 font-bold">•</span>
          <span>사이드바에서 노드를 드래그하여 캔버스에 추가</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-violet-500 font-bold">•</span>
          <span>노드의 핸들을 드래그하여 다른 노드와 연결</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-violet-500 font-bold">•</span>
          <span>엣지를 드래그해서 빈 공간에 놓으면 연결 해제</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-violet-500 font-bold">•</span>
          <span>엣지를 다른 핸들로 드래그하면 재연결</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-violet-500 font-bold">•</span>
          <span>Delete 키로 선택된 노드/엣지 삭제</span>
        </div>
      </div>
    </div>
  </aside>
);
