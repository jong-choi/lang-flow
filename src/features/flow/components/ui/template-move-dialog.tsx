"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";
import type { TemplateActionState } from "@/features/flow/stores/slices/builder-ui-slice";

export const TemplateMoveDialog = ({}) => {
  const confirmAction = useFlowGeneratorStore.use.confirmTemplateAction();
  const setConfirmAction = useFlowGeneratorStore.use.setConfirmTemplateAction();
  const setNavigationAfterSave =
    useFlowGeneratorStore.use.setNavigationAfterSave();
  const setTemplateModalOpen = useFlowGeneratorStore.use.setTemplateModalOpen();
  const router = useRouter();
  const navigateToTemplate = useCallback(
    (action: TemplateActionState) => {
      const search = new URLSearchParams({ action: action.action }).toString();
      router.push(`/flow/${action.template.id}${search ? `?${search}` : ""}`);
    },
    [router],
  );

  return (
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
              setTemplateModalOpen(true);
            }}
          >
            저장 후 이동
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
