"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileText,
  Folder,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";
import type { WorkflowSummary } from "@/features/flow/types/workflow";
import {
  filterTemplatesByQuery,
  shouldFetchTemplates,
} from "@/features/flow/utils/workflow";

export const WorkflowPalette = () => {
  const [query, setQuery] = useState("");
  const templates = useFlowGeneratorStore.use.templates();
  const isLoading = useFlowGeneratorStore.use.isLoadingTemplates();
  const fetchTemplates = useFlowGeneratorStore.use.fetchTemplates();
  const setDraggingTemplateId =
    useFlowGeneratorStore.use.setDraggingTemplateId();
  const setConfirmTemplateAction =
    useFlowGeneratorStore.use.setConfirmTemplateAction();
  const hasFetchedTemplates = useFlowGeneratorStore.use.hasFetchedTemplates();
  const removeTemplate = useFlowGeneratorStore.use.removeTemplate();
  const [pendingLicenseId, setPendingLicenseId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!hasFetchedTemplates && shouldFetchTemplates(templates)) {
      void fetchTemplates();
    }
  }, [fetchTemplates, hasFetchedTemplates, templates]);

  const filtered = useMemo(() => {
    return filterTemplatesByQuery(templates, query);
  }, [query, templates]);

  const handleDragStart = useCallback(
    (event: React.DragEvent, template: WorkflowSummary) => {
      setDraggingTemplateId(template.id);
      event.dataTransfer.effectAllowed = "copy";
      event.dataTransfer.setData("application/workflow-template", template.id);
    },
    [setDraggingTemplateId],
  );

  const handleDragEnd = useCallback(() => {
    setDraggingTemplateId(undefined);
  }, [setDraggingTemplateId]);

  const handleNavigate = useCallback(
    (template: WorkflowSummary) => {
      setConfirmTemplateAction({ template, action: "move" });
      setOpenMenuId(null);
    },
    [setConfirmTemplateAction],
  );

  const handleRemoveLicense = useCallback(
    async (template: WorkflowSummary) => {
      if (pendingLicenseId) return;
      setPendingLicenseId(template.id);
      try {
        const response = await fetch(`/api/workflows/${template.id}/licenses`, {
          method: "DELETE",
        });

        if (!response.ok && response.status !== 204) {
          throw new Error(`라이선스 제거 실패: ${response.status}`);
        }

        removeTemplate(template.id);
      } catch (error) {
        console.error("워크플로우 라이선스를 제거하지 못했습니다.", error);
      } finally {
        setPendingLicenseId(null);
      }
    },
    [pendingLicenseId, removeTemplate],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="워크플로우 템플릿 검색"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="워크플로우 템플릿 검색..."
            className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pr-3 pl-10 text-sm text-slate-900 focus:ring-2 focus:ring-violet-400 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
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
              워크플로우를 템플릿 추가해보세요.
            </p>
            <div className="mt-4">
              <button className="inline-flex items-center gap-2 rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700">
                <Plus className="size-4" /> 템플릿 추가
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
                    onClick={() => handleNavigate(template)}
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
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${template.isOwner ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200" : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"}`}
                    >
                      {template.isOwner ? "내 템플릿" : "내 계정에 추가됨"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {template.isOwner ? (
                    <DropdownMenu
                      open={openMenuId === template.id}
                      onOpenChange={(isOpen) =>
                        setOpenMenuId(isOpen ? template.id : null)
                      }
                    >
                      <DropdownMenuTrigger asChild>
                        <button
                          className="inline-flex items-center rounded-md border border-slate-200 p-2 text-slate-500 transition hover:border-violet-200 hover:text-violet-600 focus:ring-2 focus:ring-violet-200 focus:outline-none dark:border-slate-700 dark:text-slate-300 dark:hover:border-violet-400 dark:hover:text-violet-200"
                          aria-label={`${template.name} 메뉴 열기`}
                          type="button"
                        >
                          <MoreVertical className="size-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="min-w-[160px]"
                      >
                        <DropdownMenuItem
                          onClick={() => handleNavigate(template)}
                        >
                          해당 템플릿으로 이동
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <button
                      onClick={() => handleRemoveLicense(template)}
                      disabled={pendingLicenseId === template.id}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-200"
                    >
                      {pendingLicenseId === template.id ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Trash2 className="size-3" />
                      )}
                      제거
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
