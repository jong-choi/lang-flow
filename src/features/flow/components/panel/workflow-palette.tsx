"use client";

import { useMemo, useState } from "react";
import { randomUUID } from "crypto";
import { FileText, Folder, MoreHorizontal, Plus, Search } from "lucide-react";

export type Workflow = {
  id: string;
  title: string;
  description?: string;
  updatedAt?: string; // ISO date
};

export const WorkflowPalette = ({
  initialWorkflows = [],
  onOpen,
  onCreate,
}: {
  initialWorkflows?: Workflow[];
  onOpen?: (w: Workflow) => void;
  onCreate?: () => void;
}) => {
  const [query, setQuery] = useState("");
  const [workflows, setWorkflows] = useState<Workflow[]>(() =>
    initialWorkflows.length
      ? initialWorkflows
      : [
          {
            id: "example-1",
            title: "Example workflow",
            description: "A short demo workflow",
            updatedAt: new Date().toISOString(),
          },
          {
            id: "example-2",
            title: "Onboarding flow",
            description: "User onboarding sequence",
            updatedAt: new Date().toISOString(),
          },
        ],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return workflows;
    return workflows.filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        (w.description || "").toLowerCase().includes(q),
    );
  }, [query, workflows]);

  const handleCreate = () => {
    if (onCreate) return onCreate();
    const nw: Workflow = {
      id: randomUUID(),
      title: "Untitled workflow",
      description: "",
      updatedAt: new Date().toISOString(),
    };
    setWorkflows((s) => [nw, ...s]);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="검색 워크플로우"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="워크플로우 검색..."
            className="w-full pl-10 pr-3 py-2 rounded-md border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>
        <button
          onClick={handleCreate}
          aria-label="새 워크플로우 생성"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold"
        >
          <Plus className="size-4" /> 새로 만들기
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
            <Folder className="mx-auto mb-3 text-slate-400" />
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              저장된 워크플로우가 없습니다
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              워크플로우를 만들어 저장해보세요.
            </p>
            <div className="mt-4">
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 mx-auto px-3 py-2 rounded-md bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold"
              >
                <Plus className="size-4" /> 워크플로우 생성
              </button>
            </div>
          </div>
        ) : (
          <ul className="space-y-2 max-h-[48vh] overflow-y-auto pr-1">
            {filtered.map((w) => (
              <li
                key={w.id}
                className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg p-3 flex items-start gap-3"
              >
                <div className="flex-shrink-0 pt-1">
                  <FileText className="text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => onOpen?.(w)}
                    className="text-left w-full"
                    aria-label={`열기 ${w.title}`}
                  >
                    <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {w.title}
                    </div>
                    {w.description ? (
                      <div className="text-xs text-slate-600 dark:text-slate-300 truncate">
                        {w.description}
                      </div>
                    ) : null}
                  </button>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {w.updatedAt ? (
                      <span>
                        최근 수정 {new Date(w.updatedAt).toLocaleDateString()}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    title="더보기"
                    aria-label={`더보기 ${w.title}`}
                    className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <MoreHorizontal className="size-4 text-slate-500 dark:text-slate-400" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
