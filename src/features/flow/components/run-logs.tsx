"use client";

import React from "react";

// TODO: 임시 로깅 UI
export function RunLogs({
  logs,
  onClear,
}: {
  logs: string[];
  onClear: () => void;
}) {
  return (
    <div className="w-96 max-w-[28rem] h-48 bg-white/80 border border-slate-200 rounded-lg p-2 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-semibold text-slate-700">실행 로그</div>
        <button
          className="text-xs text-slate-500 hover:text-slate-700"
          onClick={onClear}
        >
          비우기
        </button>
      </div>
      <div className="h-[calc(100%-1.5rem)] overflow-auto font-mono text-[11px] leading-relaxed text-slate-700">
        {logs.length === 0 ? (
          <div className="text-slate-400">로그가 없습니다.</div>
        ) : (
          logs.map((l, idx) => <div key={idx}>{l}</div>)
        )}
      </div>
    </div>
  );
}
