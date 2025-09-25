"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkflowLicenseRequestDialog } from "@/features/flow/components/sharing/business/workflow-license-request-dialog";
import { WorkflowShareHero } from "@/features/flow/components/sharing/ui/workflow-share-hero";
import { WorkflowShareSection } from "@/features/flow/components/sharing/ui/workflow-share-section";
import type {
  WorkflowLicenseRequest,
  WorkflowShareDetail,
} from "@/features/flow/types/workflow-sharing";

interface WorkflowShareDetailContentProps {
  share: WorkflowShareDetail;
  viewerId?: string | null;
}

export function WorkflowShareDetailContent({
  share,
  viewerId,
}: WorkflowShareDetailContentProps) {
  const router = useRouter();
  const [licenseOpen, setLicenseOpen] = useState(false);

  const isOwner = share.viewerContext?.isOwner ?? share.owner.id === viewerId;
  const licenseStatus = share.viewerContext?.licenseStatus;

  const handleLicenseSuccess = (license: WorkflowLicenseRequest) => {
    if (license.status === "pending") {
      router.refresh();
    }
  };

  const openLicenseDialog = () => {
    if (!viewerId) {
      router.push(`/auth/signin?redirect=/flow/sharing/${share.workflowId}`);
      return;
    }
    setLicenseOpen(true);
  };

  const primaryAction = isOwner ? (
    <Button asChild>
      <Link href={`/flow/${share.workflowId}`}>워크플로우 관리하기</Link>
    </Button>
  ) : (
    <Button onClick={openLicenseDialog} disabled={licenseStatus === "pending"}>
      {licenseStatus === "pending" ? "요청 대기 중" : "라이선스 요청"}
    </Button>
  );

  const secondaryAction = isOwner ? (
    <p className="text-xs text-muted-foreground">
      공유 정보를 수정하려면 워크플로우 편집 화면에서 업데이트하세요.
    </p>
  ) : (
    <p className="text-xs text-muted-foreground">
      요청이 승인되면 이메일로 알림을 보내드립니다.
    </p>
  );

  return (
    <div className="space-y-10">
      <WorkflowShareHero
        share={share}
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
      />

      <WorkflowShareSection
        title="워크플로우 설명"
        description="워크플로우 세부 설명"
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          <p className="whitespace-pre-line">
            {share.workflowDescription ??
              "워크플로우 설명이 아직 작성되지 않았습니다."}
          </p>
          <div className="flex flex-wrap gap-2">
            {share.tags.map((tag) => (
              <Badge key={`${share.shareId}-${tag}`} variant="outline">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      </WorkflowShareSection>

      <WorkflowLicenseRequestDialog
        open={licenseOpen}
        onOpenChange={setLicenseOpen}
        workflowId={share.workflowId}
        workflowTitle={share.workflowName}
        onSuccess={handleLicenseSuccess}
      />
    </div>
  );
}
