"use client";

import React from "react";
import {
  Bomb,
  CheckCircle2,
  ClipboardList,
  PartyPopper,
  Radio,
  RefreshCw,
  Rocket,
  Trash2,
  XCircle,
} from "lucide-react";
import type { FlowEventBase } from "@/types/flow";

interface RunLogsProps {
  events: FlowEventBase[];
  onClear: () => void;
}

function formatTimestamp() {
  return new Date().toLocaleTimeString();
}

function getEventIcon(eventType: string) {
  switch (eventType) {
    case "flow_start":
      return <Rocket className="size-3" />;
    case "node_start":
      return <RefreshCw className="size-3" />;
    case "node_complete":
      return <CheckCircle2 className="size-3" />;
    case "node_streaming":
      return <Radio className="size-3" />;
    case "node_error":
      return <XCircle className="size-3" />;
    case "flow_complete":
      return <PartyPopper className="size-3" />;
    case "flow_error":
      return <Bomb className="size-3" />;
    default:
      return <ClipboardList className="size-3" />;
  }
}

function getEventColor(eventType: string) {
  switch (eventType) {
    case "flow_start":
      return "text-blue-700 font-semibold";
    case "node_start":
      return "text-blue-600";
    case "node_complete":
      return "text-green-600";
    case "node_streaming":
      return "text-purple-600";
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
    <div className="w-96 max-w-[28rem] h-80 bg-white/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg p-2 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          실행 로그
        </div>
        <button
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 inline-flex items-center gap-1"
          onClick={onClear}
        >
          <Trash2 className="size-3" /> 비우기
        </button>
      </div>
      <div className="h-[calc(100%-1.5rem)] overflow-auto font-mono text-[11px] leading-relaxed">
        {events.length === 0 ? (
          <div className="text-slate-400 dark:text-slate-500">
            로그가 없습니다.
          </div>
        ) : (
          events.map((event, idx) => {
            const icon = getEventIcon(event.event);
            const colorClass = getEventColor(event.event);
            const time = formatTimestamp();

            return (
              <div key={idx} className={`mb-1 ${colorClass}`}>
                <div className="flex items-start gap-1">
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    {icon}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {time}
                  </span>
                  <div className="flex-1">
                    {event.event === "flow_start" && <span>플로우 시작</span>}
                    {event.event === "node_start" && (
                      <span>노드 시작: {event.nodeId}</span>
                    )}
                    {event.event === "node_complete" && (
                      <span>노드 완료: {event.nodeId}</span>
                    )}
                    {event.event === "node_streaming" && (
                      <span>노드 스트리밍: {event.nodeId}</span>
                    )}
                    {event.event === "node_error" && (
                      <span>
                        노드 오류: {event.nodeId} - {event.error}
                      </span>
                    )}
                    {event.event === "flow_complete" && (
                      <span>플로우 완료!</span>
                    )}
                    {event.event === "flow_error" && (
                      <span>플로우 오류: {event.error}</span>
                    )}
                    {event.message && (
                      <span className="text-slate-600 dark:text-slate-300">
                        {" "}
                        - {event.message}
                      </span>
                    )}
                  </div>
                </div>
                {event.event === "node_complete" && event.data != null && (
                  <div className="ml-4 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-1 rounded mt-1">
                    {typeof event.data === "string"
                      ? event.data
                      : typeof event.data === "object"
                        ? JSON.stringify(event.data, null, 2).slice(0, 200) +
                          "..."
                        : String(event.data)}
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
