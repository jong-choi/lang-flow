"use client";

import React from "react";
import { Bot, MessageSquare, SquareTerminal } from "lucide-react";

interface ResultsTabProps {
  chatResults: Record<string, string>;
  sessionId?: string | null;
}

/**
 * 채팅 노드의 결과물을 표시하는 탭
 */
export function ResultsTab({ chatResults, sessionId }: ResultsTabProps) {
  const entries = Object.entries(chatResults);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="shrink-0 border-b bg-white/60 dark:bg-slate-900/60 backdrop-blur supports-[backdrop-filter]:bg-white/40 border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-50 font-extrabold tracking-tight">
          <MessageSquare className="size-5" /> 결과물
        </div>
        {sessionId && (
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <SquareTerminal className="size-3" />
            세션: {sessionId}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4 space-y-4">
        {entries.length === 0 ? (
          <div className="text-slate-500 dark:text-slate-400 text-sm">
            표시할 채팅 노드 결과가 없습니다.
          </div>
        ) : (
          entries.map(([nodeId, text]) => (
            <div
              key={nodeId}
              className="rounded-xl border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            >
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <Bot className="size-4" /> chatNode • {nodeId}
              </div>
              <div className="p-4">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-slate-900 dark:text-slate-100">
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
