"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, Folder, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";
import type { WorkflowTemplateSummary } from "@/features/flow/types/nodes";
import {
  filterTemplatesByQuery,
  shouldFetchTemplates,
} from "@/features/flow/utils/workflow";

interface WorkflowPaletteProps {
  onOpen?: (template: WorkflowTemplateSummary) => void;
  onCreate?: () => void;
  onAction?: (
    template: WorkflowTemplateSummary,
    action: "edit" | "delete",
  ) => void;
}

export const WorkflowPalette = ({
  onOpen,
  onCreate,
  onAction,
}: WorkflowPaletteProps) => {
  const [query, setQuery] = useState("");
  const templates = useFlowGeneratorStore.use.templates();
  const isLoading = useFlowGeneratorStore.use.isLoadingTemplates();
  const fetchTemplates = useFlowGeneratorStore.use.fetchTemplates();
  const setDraggingTemplateId =
    useFlowGeneratorStore.use.setDraggingTemplateId();

  useEffect(() => {
    if (shouldFetchTemplates(templates)) {
      void fetchTemplates();
    }
  }, [fetchTemplates, templates]);

  const filtered = useMemo(() => {
    return filterTemplatesByQuery(templates, query);
  }, [query, templates]);

  const handleCreate = useCallback(() => {
    if (onCreate) {
      onCreate();
      return;
    }
    void fetchTemplates();
  }, [fetchTemplates, onCreate]);

  const handleDragStart = useCallback(
    (event: React.DragEvent, template: WorkflowTemplateSummary) => {
      setDraggingTemplateId(template.id);
      event.dataTransfer.effectAllowed = "copy";
      event.dataTransfer.setData("application/workflow-template", template.id);
    },
    [setDraggingTemplateId],
  );

  const handleDragEnd = useCallback(() => {
    setDraggingTemplateId(undefined);
  }, [setDraggingTemplateId]);

  const handleAction = useCallback(
    (template: WorkflowTemplateSummary, action: "edit" | "delete") => {
      onAction?.(template, action);
    },
    [onAction],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="워크플로우 템플릿 검색"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="워크플로우 템플릿 검색..."
            className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
        <button
          onClick={handleCreate}
          aria-label="새 템플릿 생성"
          className="inline-flex items-center gap-2 rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          <Plus className="size-4" /> 새로 만들기
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-white/60 py-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
            <Loader2 className="size-4 animate-spin" /> 템플릿을 불러오는
            중입니다
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-white/50 px-4 py-8 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <Folder className="mx-auto mb-3 text-slate-400" />
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              저장된 템플릿이 없습니다
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              워크플로우를 템플릿으로 저장해보세요.
            </p>
            <div className="mt-4">
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <Plus className="size-4" /> 템플릿 생성
              </button>
            </div>
          </div>
        ) : (
          <ul className="max-h-[48vh] space-y-2 overflow-y-auto pr-1">
            {filtered.map((template) => (
              <li
                key={template.id}
                className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white p-3 shadow-sm transition hover:border-violet-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
                draggable
                onDragStart={(event) => handleDragStart(event, template)}
                onDragEnd={handleDragEnd}
              >
                <div className="flex-shrink-0 pt-1">
                  <FileText className="text-violet-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <button
                    onClick={() => onOpen?.(template)}
                    className="w-full text-left"
                    aria-label={`템플릿 열기 ${template.name}`}
                  >
                    <div className="truncate font-semibold text-slate-900 dark:text-slate-100">
                      {template.name}
                    </div>
                    {template.description ? (
                      <div className="truncate text-xs text-slate-600 dark:text-slate-300">
                        {template.description}
                      </div>
                    ) : null}
                  </button>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {template.updatedAt ? (
                      <span>
                        최근 수정{" "}
                        {new Date(template.updatedAt).toLocaleDateString()}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(template, "edit")}
                    className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:border-violet-200 hover:text-violet-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-violet-400 dark:hover:text-violet-300"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleAction(template, "delete")}
                    className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/40"
                    aria-label={`템플릿 삭제 ${template.name}`}
                  >
                    <Trash2 className="size-3" /> 삭제
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
