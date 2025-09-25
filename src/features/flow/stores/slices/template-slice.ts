import type { StateCreator } from "zustand";
import type {
  WorkflowDetail,
  WorkflowSummary,
} from "@/features/flow/types/workflow";
import { deserializeWorkflowDetail, toWorkflowSummary } from "@/features/flow/utils/workflow-transformers";
import type { WorkflowApiDetail } from "@/features/flow/types/workflow-api";

interface WorkflowListResponse {
  workflows: WorkflowApiDetail[];
}

interface WorkflowDetailResponse {
  workflow: WorkflowApiDetail;
}

export interface TemplateSlice {
  templates: WorkflowSummary[];
  templateDetails: Record<string, WorkflowDetail>;
  isLoadingTemplates: boolean;
  hasFetchedTemplates: boolean;
  draggingTemplateId: string | undefined;
  fetchTemplates: () => Promise<void>;
  ensureTemplateDetail: (id: string) => Promise<WorkflowDetail | null>;
  setDraggingTemplateId: (id: string | undefined) => void;
  upsertTemplate: (template: WorkflowSummary) => void;
  removeTemplate: (id: string) => void;
  cacheTemplateDetail: (detail: WorkflowDetail) => void;
}

export const createTemplateSlice: StateCreator<TemplateSlice> = (set, get) => ({
  templates: [],
  templateDetails: {},
  isLoadingTemplates: false,
  hasFetchedTemplates: false,
  draggingTemplateId: undefined,
  fetchTemplates: async () => {
    set({ isLoadingTemplates: true });
    try {
      const response = await fetch("/api/workflows", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`워크플로우 목록 조회 실패: ${response.status}`);
      }
      const payload = (await response.json()) as WorkflowListResponse;
      const summaries = payload.workflows.map(toWorkflowSummary);
      set({
        templates: summaries,
        isLoadingTemplates: false,
        hasFetchedTemplates: true,
      });
    } catch (error) {
      console.error("워크플로우 템플릿 목록을 불러오지 못했습니다.", error);
      set({ isLoadingTemplates: false, hasFetchedTemplates: true });
    }
  },
  ensureTemplateDetail: async (id) => {
    const { templateDetails } = get();
    if (templateDetails[id]) {
      return templateDetails[id];
    }

    try {
      const response = await fetch(`/api/workflows/${id}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        console.error("워크플로우 상세 조회 실패", response.status);
        return null;
      }
      const payload = (await response.json()) as WorkflowDetailResponse;
      const detail = deserializeWorkflowDetail(payload.workflow);
      set((prev) => {
        const templateDetails = prev.templateDetails;
        if (templateDetails[id]) {
          return prev;
        }

        return {
          templateDetails: { ...prev.templateDetails, [id]: detail },
          templates: prev.templates.some((item) => item.id === id)
            ? prev.templates
            : prev.templates.concat(toWorkflowSummary(payload.workflow)),
        };
      });
      return detail;
    } catch (error) {
      console.error("워크플로우 상세 정보를 불러오지 못했습니다.", error);
      return null;
    }
  },
  setDraggingTemplateId: (id) => set({ draggingTemplateId: id }),
  upsertTemplate: (template) =>
    set((prev) => {
      const templateExists = prev.templates.some(
        (item) => item.id === template.id,
      );
      const hasTemplateDetail = Boolean(prev.templateDetails[template.id]);

      return {
        templates: templateExists
          ? prev.templates.map((item) =>
              item.id === template.id ? template : item,
            )
          : [template, ...prev.templates],
        templateDetails: hasTemplateDetail
          ? {
              ...prev.templateDetails,
              [template.id]: {
                ...prev.templateDetails[template.id],
                ...template,
              },
            }
          : prev.templateDetails,
      };
    }),
  removeTemplate: (id) =>
    set((prev) => {
      const restDetails = { ...prev.templateDetails };
      delete restDetails[id];
      return {
        templates: prev.templates.filter((item) => item.id !== id),
        templateDetails: restDetails,
      };
    }),
  cacheTemplateDetail: (detail) =>
    set((prev) => ({
      templateDetails: { ...prev.templateDetails, [detail.id]: detail },
      templates: prev.templates.some((item) => item.id === detail.id)
        ? prev.templates
        : [
            {
              id: detail.id,
              name: detail.name,
              description: detail.description ?? null,
              updatedAt: detail.updatedAt ?? null,
              ownership: detail.ownership,
              isOwner: detail.isOwner,
              isLicensed: detail.isLicensed,
            },
            ...prev.templates,
          ],
    })),
});
