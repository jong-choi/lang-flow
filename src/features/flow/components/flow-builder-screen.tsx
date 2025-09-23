"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FlowSection } from "@/features/flow/components/flow-section";
import { FlowHeader } from "@/features/flow/components/header/flow-header";
import {
  type TemplateFormValues,
  TemplateSaveDialog,
} from "@/features/flow/components/template-save-dialog";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";
import type {
  SchemaEdge,
  SchemaNode,
  WorkflowTemplateSummary,
} from "@/features/flow/types/nodes";
import {
  deserializeWorkflowDetail,
  serializeEdgeForApi,
  serializeNodeForApi,
  toTemplateSummary,
} from "@/features/flow/utils/workflow-transformers";

interface FlowBuilderScreenProps {
  initialNodes?: SchemaNode[];
  initialEdges?: SchemaEdge[];
  workflowName?: string;
}

interface TemplateAction {
  template: WorkflowTemplateSummary;
  action: "edit" | "delete";
}

export const FlowBuilderScreen = ({
  initialNodes,
  initialEdges,
  workflowName,
}: FlowBuilderScreenProps) => {
  const router = useRouter();
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [confirmAction, setConfirmAction] = useState<TemplateAction | null>(
    null,
  );
  const [navigationAfterSave, setNavigationAfterSave] =
    useState<TemplateAction | null>(null);
  const canvasNodes = useFlowGeneratorStore.use.canvasNodes();
  const canvasEdges = useFlowGeneratorStore.use.canvasEdges();
  const upsertTemplate = useFlowGeneratorStore.use.upsertTemplate();
  const cacheTemplateDetail = useFlowGeneratorStore.use.cacheTemplateDetail();
  const fetchTemplates = useFlowGeneratorStore.use.fetchTemplates();

  const navigateToTemplate = useCallback(
    (action: TemplateAction) => {
      const search = new URLSearchParams({ action: action.action }).toString();
      router.push(`/flow/${action.template.id}${search ? `?${search}` : ""}`);
    },
    [router],
  );

  const handleTemplateSubmit = useCallback(
    async (values: TemplateFormValues) => {
      if (canvasNodes.length === 0) {
        toast.error("캔버스에 노드가 없습니다.");
        return;
      }

      setIsSavingTemplate(true);
      try {
        const response = await fetch("/api/workflows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name,
            description: values.description ?? null,
            nodes: canvasNodes.map(serializeNodeForApi),
            edges: canvasEdges.map(serializeEdgeForApi),
          }),
        });

        if (!response.ok) {
          toast.error("템플릿 저장에 실패했습니다.");
          return;
        }

        const payload = await response.json();
        const detail = deserializeWorkflowDetail(payload.workflow);
        cacheTemplateDetail(detail);
        upsertTemplate(toTemplateSummary(payload.workflow));
        toast.success("템플릿이 저장되었습니다.");
        setShowTemplateModal(false);
        void fetchTemplates();

        if (navigationAfterSave) {
          navigateToTemplate(navigationAfterSave);
          setNavigationAfterSave(null);
        }
      } catch (error) {
        console.error("템플릿 저장 실패", error);
        toast.error("템플릿 저장 중 오류가 발생했습니다.");
      } finally {
        setIsSavingTemplate(false);
      }
    },
    [
      cacheTemplateDetail,
      canvasEdges,
      canvasNodes,
      fetchTemplates,
      navigateToTemplate,
      navigationAfterSave,
      upsertTemplate,
    ],
  );

  const handleTemplateAction = useCallback((action: TemplateAction) => {
    setConfirmAction(action);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <FlowHeader
        initialName={workflowName}
        onSaveTemplate={() => setShowTemplateModal(true)}
      />
      <FlowSection
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        onTemplateAction={(template, action) =>
          handleTemplateAction({ template, action })
        }
        onTemplateCreate={() => setShowTemplateModal(true)}
      />
      <TemplateSaveDialog
        open={showTemplateModal}
        onOpenChange={setShowTemplateModal}
        onSubmit={handleTemplateSubmit}
        isSubmitting={isSavingTemplate}
        initialName={workflowName ?? "새 템플릿"}
      />
      <Dialog
        open={!!confirmAction}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmAction(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>현재 워크플로우를 저장할까요?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            이동하기 전에 현재 워크플로우를 템플릿으로 저장할 수 있습니다.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              취소
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (!confirmAction) return;
                navigateToTemplate(confirmAction);
                setConfirmAction(null);
                setNavigationAfterSave(null);
              }}
            >
              저장 없이 이동
            </Button>
            <Button
              onClick={() => {
                if (!confirmAction) return;
                setNavigationAfterSave(confirmAction);
                setConfirmAction(null);
                setShowTemplateModal(true);
              }}
            >
              저장 후 이동
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
