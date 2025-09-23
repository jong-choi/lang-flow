"use client";

import React from "react";
import { Bot, MessageSquare, SquareTerminal } from "lucide-react";

interface ResultsTabProps {
  results: Array<{ nodeId: string; nodeType: string; text: string }>;
  sessionId?: string | null;
}

/**
 * 채팅 노드의 결과물을 표시하는 탭
 */
export function ResultsTab({ results, sessionId }: ResultsTabProps) {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white/60 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-white/40 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center gap-2 font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          <MessageSquare className="size-5" /> 결과물
        </div>
        {sessionId && (
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <SquareTerminal className="size-3" />
            세션: {sessionId}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4">
        {results.length === 0 ? (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            표시할 채팅 노드 결과가 없습니다.
          </div>
        ) : (
          results.map(({ nodeId, nodeType, text }) => (
            <div
              key={nodeId}
              className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-300">
                <Bot className="size-4" /> {nodeType} • {nodeId}
              </div>
              <div className="p-4">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <pre className="font-sans text-sm leading-6 whitespace-pre-wrap text-slate-900 dark:text-slate-100">
                    {text}
                  </pre>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
