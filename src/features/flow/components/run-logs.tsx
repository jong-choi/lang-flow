"use client";

import React from "react";
import type { StreamingEvent } from "@/types/flow";

interface RunLogsProps {
  events: StreamingEvent[];
  onClear: () => void;
}

function formatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString();
}

function getEventIcon(eventType: StreamingEvent["type"]) {
  switch (eventType) {
    case "node_start":
      return "🔄";
    case "node_complete":
      return "✅";
    case "node_error":
      return "❌";
    case "flow_complete":
      return "🎉";
    case "flow_error":
      return "💥";
    default:
      return "📋";
  }
}

function getEventColor(eventType: StreamingEvent["type"]) {
  switch (eventType) {
    case "node_start":
      return "text-blue-600";
    case "node_complete":
      return "text-green-600";
    case "node_error":
      return "text-red-600";
    case "flow_complete":
      return "text-green-700 font-semibold";
    case "flow_error":
      return "text-red-700 font-semibold";
    default:
      return "text-slate-600";
  }
}

export function RunLogs({ events, onClear }: RunLogsProps) {
  return (
    <div className="w-96 max-w-[28rem] h-80 bg-white/80 border border-slate-200 rounded-lg p-2 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-semibold text-slate-700">실행 로그</div>
        <button
          className="text-xs text-slate-500 hover:text-slate-700"
          onClick={onClear}
        >
          비우기
        </button>
      </div>
      <div className="h-[calc(100%-1.5rem)] overflow-auto font-mono text-[11px] leading-relaxed">
        {events.length === 0 ? (
          <div className="text-slate-400">로그가 없습니다.</div>
        ) : (
          events.map((event, idx) => {
            const icon = getEventIcon(event.type);
            const colorClass = getEventColor(event.type);
            const time = formatTimestamp(event.timestamp);

            return (
              <div key={idx} className={`mb-1 ${colorClass}`}>
                <div className="flex items-start gap-1">
                  <span className="text-xs">{icon}</span>
                  <span className="text-xs text-slate-500">{time}</span>
                  <div className="flex-1">
                    {event.type === "node_start" && (
                      <span>노드 시작: {event.nodeName}</span>
                    )}
                    {event.type === "node_complete" && (
                      <span>노드 완료: {event.nodeName}</span>
                    )}
                    {event.type === "node_error" && (
                      <span>
                        노드 오류: {event.nodeName} - {event.error}
                      </span>
                    )}
                    {event.type === "flow_complete" && (
                      <span>플로우 완료!</span>
                    )}
                    {event.type === "flow_error" && (
                      <span>플로우 오류: {event.error}</span>
                    )}
                  </div>
                </div>
                {event.type === "node_complete" && event.result != null && (
                  <div className="ml-4 text-xs text-slate-600 bg-slate-50 p-1 rounded mt-1">
                    {typeof event.result === "string"
                      ? event.result
                      : typeof event.result === "object"
                        ? JSON.stringify(event.result, null, 2).slice(0, 200) +
                          "..."
                        : String(event.result)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
