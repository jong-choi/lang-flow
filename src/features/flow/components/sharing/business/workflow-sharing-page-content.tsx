"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { WorkflowShareCard } from "@/features/flow/components/sharing/ui/workflow-share-card";
import { WorkflowShareEmptyState } from "@/features/flow/components/sharing/ui/workflow-share-empty-state";
import { WorkflowShareGrid } from "@/features/flow/components/sharing/ui/workflow-share-grid";
import { WorkflowLicenseRequestDialog } from "@/features/flow/components/sharing/business/workflow-license-request-dialog";
import { WorkflowShareRegisterDialog } from "@/features/flow/components/sharing/business/workflow-share-register-dialog";
import type {
  WorkflowLicenseRequestRecord,
  WorkflowShareDetail,
  WorkflowShareSummary,
} from "@/features/flow/types/workflow-sharing";
import type { ShareableWorkflowOption } from "@/features/flow/components/sharing/form/workflow-share-form";
import { Button } from "@/components/ui/button";

interface WorkflowSharingPageContentProps {
  initialShares: WorkflowShareSummary[];
  viewerId?: string | null;
  shareableWorkflows: ShareableWorkflowOption[];
}

const detailToSummary = (share: WorkflowShareDetail): WorkflowShareSummary => ({
  workflowId: share.workflowId,
  shareId: share.shareId,
  workflowName: share.workflowName,
  workflowDescription: share.workflowDescription,
  summary: share.summary,
  priceInCredits: share.priceInCredits,
  tags: share.tags,
  licenseCount: share.licenseCount,
  owner: share.owner,
  createdAt: share.createdAt,
  updatedAt: share.updatedAt,
});

export function WorkflowSharingPageContent({
  initialShares,
  viewerId,
  shareableWorkflows,
}: WorkflowSharingPageContentProps) {
  const router = useRouter();
  const [shares, setShares] = useState(initialShares);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [licenseOpen, setLicenseOpen] = useState(false);
  const [selectedShare, setSelectedShare] = useState<WorkflowShareSummary | null>(
    null,
  );

  const [workflowPool, setWorkflowPool] = useState(shareableWorkflows);

  const availableWorkflows = useMemo(
    () =>
      workflowPool.filter(
        (workflow) =>
          !shares.some((share) => share.workflowId === workflow.id),
      ),
    [shares, workflowPool],
  );

  const canRegister = Boolean(viewerId) && availableWorkflows.length > 0;

  const openRegister = () => {
    if (!viewerId) return;
    setRegisterOpen(true);
  };

  const openLicenseDialog = (share: WorkflowShareSummary) => {
    if (!viewerId) {
      router.push("/auth/signin?redirect=/flow/sharing");
      return;
    }
    setSelectedShare(share);
    setLicenseOpen(true);
  };

  const handleRegisterSuccess = (detail: WorkflowShareDetail) => {
    setShares((prev) => {
      const summary = detailToSummary(detail);
      const exists = prev.some((item) => item.shareId === summary.shareId);
      if (exists) {
        return prev.map((item) =>
          item.shareId === summary.shareId ? summary : item,
        );
      }
      return [summary, ...prev];
    });
    setWorkflowPool((prev) =>
      prev.filter((workflow) => workflow.id !== detail.workflowId),
    );
    router.refresh();
  };

  const handleLicenseSuccess = (license: WorkflowLicenseRequestRecord) => {
    setShares((prev) =>
      prev.map((item) =>
        item.workflowId === license.workflowId
          ? { ...item, licenseCount: item.licenseCount + 1 }
          : item,
      ),
    );
    router.refresh();
  };

  const handleNavigateDetail = (share: WorkflowShareSummary) => {
    router.push(`/flow/sharing/${share.workflowId}`);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-3xl border bg-background p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">워크플로우 공유 마켓</h1>
          <p className="text-sm text-muted-foreground">
            검증된 워크플로우를 공유하고 다른 팀의 노하우를 라이선스로 활용해보세요.
          </p>
        </div>
        <Button onClick={openRegister} disabled={!canRegister}>
          워크플로우 등록하기
        </Button>
      </header>

      {shares.length ? (
        <WorkflowShareGrid>
          {shares.map((share) => (
            <WorkflowShareCard
              key={share.shareId}
              share={share}
              isOwner={share.owner.id === viewerId}
              onDetail={handleNavigateDetail}
              onLicense={openLicenseDialog}
            />
          ))}
        </WorkflowShareGrid>
      ) : (
        <WorkflowShareEmptyState
          onAction={canRegister ? openRegister : undefined}
          actionLabel="워크플로우 등록하기"
          description={
            canRegister
              ? "첫 번째 공유를 등록하면 다른 사용자가 라이선스를 요청할 수 있어요."
              : viewerId
                ? "등록 가능한 워크플로우가 없습니다. 먼저 워크플로우를 생성해주세요."
                : "로그인 후 워크플로우를 공유할 수 있습니다."
          }
        />
      )}

      <WorkflowShareRegisterDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        workflows={availableWorkflows}
        onSuccess={handleRegisterSuccess}
      />

      <WorkflowLicenseRequestDialog
        open={licenseOpen}
        onOpenChange={setLicenseOpen}
        workflowId={selectedShare?.workflowId ?? ""}
        workflowTitle={selectedShare?.workflowName ?? ""}
        onSuccess={handleLicenseSuccess}
      />
    </div>
  );
}
