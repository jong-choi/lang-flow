"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WorkflowShareForm } from "@/features/flow/components/sharing/form/workflow-share-form";
import type { ShareableWorkflowOption } from "@/features/flow/components/sharing/form/workflow-share-form";
import type {
  WorkflowShareDetail,
  WorkflowShareFormValues,
} from "@/features/flow/types/workflow-sharing";
import { api } from "@/lib/api-client";

interface WorkflowShareRegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflows: ShareableWorkflowOption[];
  onSuccess?: (share: WorkflowShareDetail) => void;
}

interface CreateShareResponse {
  share: WorkflowShareDetail;
}

type DialogStep = "select" | "form";

export function WorkflowShareRegisterDialog({
  open,
  onOpenChange,
  workflows,
  onSuccess,
}: WorkflowShareRegisterDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<DialogStep>("select");
  const [selectedWorkflow, setSelectedWorkflow] =
    useState<ShareableWorkflowOption | null>(null);

  const availableWorkflows = useMemo(() => workflows, [workflows]);
  const hasWorkflow = availableWorkflows.length > 0;

  useEffect(() => {
    if (!open) {
      setStep("select");
      setSelectedWorkflow(null);
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (values: WorkflowShareFormValues) => {
    try {
      setSubmitting(true);
      const response = await api.post<CreateShareResponse>(
        "/api/flow/sharing",
        values,
      );
      toast.success("워크플로우를 공유 목록에 등록했습니다.");
      onSuccess?.(response.share);
      onOpenChange(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "워크플로우 등록에 실패했습니다.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelect = (workflow: ShareableWorkflowOption) => {
    setSelectedWorkflow(workflow);
    setStep("form");
  };

  const handleBack = () => {
    setSelectedWorkflow(null);
    setStep("select");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {step === "select" ? (
          <>
            <DialogHeader>
              <DialogTitle>공유할 워크플로우 선택</DialogTitle>
              <DialogDescription>
                공유하고 싶은 워크플로우를 선택하세요. 선택 후 추가 정보를
                입력합니다.
              </DialogDescription>
            </DialogHeader>
            {hasWorkflow ? (
              <div className="space-y-3">
                {availableWorkflows.map((workflow) => (
                  <button
                    key={workflow.id}
                    type="button"
                    className="w-full rounded-xl border bg-muted/10 p-4 text-left transition hover:bg-muted"
                    onClick={() => handleSelect(workflow)}
                  >
                    <div className="font-semibold text-foreground">
                      {workflow.name}
                    </div>
                    <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {workflow.description ?? "워크플로우 설명이 없습니다."}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                공유 가능한 워크플로우가 없습니다. 먼저 워크플로우를
                생성해주세요.
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)} variant="outline">
                닫기
              </Button>
            </DialogFooter>
          </>
        ) : selectedWorkflow ? (
          <>
            <DialogHeader>
              <DialogTitle>워크플로우 공유 등록</DialogTitle>
              <DialogDescription>
                워크플로우 정보와 함께 한 줄 소개, 태그, 가격을 입력해주세요.
              </DialogDescription>
            </DialogHeader>
            <WorkflowShareForm
              workflow={selectedWorkflow}
              isSubmitting={submitting}
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
              onBack={handleBack}
            />
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
