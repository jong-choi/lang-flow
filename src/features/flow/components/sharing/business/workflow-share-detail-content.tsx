"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CreditSummaryResponse } from "@/features/credit/types/credit-apis";
import { WorkflowSharePurchaseDialog } from "@/features/flow/components/sharing/business/workflow-share-purchase-dialog";
import { WorkflowGraphPreview } from "@/features/flow/components/sharing/ui/workflow-graph-preview";
import { WorkflowShareHero } from "@/features/flow/components/sharing/ui/workflow-share-hero";
import { WorkflowShareSection } from "@/features/flow/components/sharing/ui/workflow-share-section";
import type { WorkflowShareDetail } from "@/features/flow/types/workflow-sharing";
import { api } from "@/lib/api-client";

interface WorkflowShareDetailContentProps {
  share: WorkflowShareDetail;
  viewerId?: string | null;
}

interface PurchaseWorkflowShareResponse {
  share: WorkflowShareDetail;
  credit?: CreditSummaryResponse["credit"];
}

export function WorkflowShareDetailContent({
  share,
  viewerId,
}: WorkflowShareDetailContentProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [shareState, setShareState] = useState(share);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);

  const isOwner = useMemo(
    () => shareState.viewerContext?.isOwner ?? shareState.owner.id === viewerId,
    [shareState, viewerId],
  );
  const hasLicense = shareState.viewerContext?.hasLicense ?? false;

  const creditQuery = useQuery<CreditSummaryResponse>({
    queryKey: ["credit", "summary", viewerId],
    enabled: Boolean(viewerId) && purchaseOpen,
    queryFn: async () =>
      api.get<CreditSummaryResponse>("/api/credit", {
        params: { userId: viewerId ?? "" },
      }),
  });

  const currentCredits = creditQuery.data?.credit.balance;

  const handleDialogOpenChange = (open: boolean) => {
    if (isProcessingPurchase) return;
    if (open && !viewerId) {
      router.push(
        `/auth/signin?redirect=/flow/sharing/${shareState.workflowId}`,
      );
      return;
    }
    setPurchaseOpen(open);
  };

  const handlePrimaryClick = () => {
    if (isOwner) {
      router.push(`/flow/${shareState.workflowId}`);
      return;
    }

    if (!viewerId) {
      router.push(
        `/auth/signin?redirect=/flow/sharing/${shareState.workflowId}`,
      );
      return;
    }

    if (hasLicense) {
      router.push(`/flow/${shareState.workflowId}`);
      return;
    }

    setPurchaseOpen(true);
  };

  const handlePurchaseConfirm = async () => {
    if (!viewerId) return;

    try {
      setIsProcessingPurchase(true);
      const response = await api.post<PurchaseWorkflowShareResponse>(
        `/api/flow/sharing/${shareState.workflowId}`,
      );
      setShareState(response.share);
      toast.success("내 워크플로우에 추가되었습니다.");

      if (response.credit) {
        queryClient.setQueryData(["credit", "summary", viewerId], {
          credit: response.credit,
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: ["credit", "summary", viewerId],
        });
      }

      setPurchaseOpen(false);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "워크플로우 구매에 실패했습니다.";
      toast.error(message);
    } finally {
      setIsProcessingPurchase(false);
    }
  };

  const primaryAction = isOwner ? (
    <Button asChild>
      <Link href={`/flow/${shareState.workflowId}`}>워크플로우 관리하기</Link>
    </Button>
  ) : (
    <Button
      onClick={handlePrimaryClick}
      disabled={isProcessingPurchase}
      variant={hasLicense ? "secondary" : "default"}
    >
      {isProcessingPurchase && !hasLicense ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" /> 구매 중...
        </>
      ) : hasLicense ? (
        "사용하기"
      ) : (
        "구매하기"
      )}
    </Button>
  );

  const secondaryAction = isOwner ? (
    <p className="text-xs text-muted-foreground">
      공유 정보를 수정하려면 워크플로우 편집 화면에서 업데이트하세요.
    </p>
  ) : hasLicense ? (
    <p className="text-xs text-muted-foreground">
      내 워크플로우에서 바로 사용할 수 있습니다.
    </p>
  ) : (
    <p className="text-xs text-muted-foreground">
      구매 후 내 워크플로우에 즉시 추가됩니다.
    </p>
  );

  return (
    <div className="space-y-10">
      <WorkflowShareHero
        share={shareState}
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
      />

      <WorkflowShareSection
        title="워크플로우 설명"
        description="워크플로우 세부 설명"
      >
        <div className="space-y-6">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="whitespace-pre-line">
              {shareState.workflowDescription ??
                "워크플로우 설명이 아직 작성되지 않았습니다."}
            </p>
            <div className="flex flex-wrap gap-2">
              {shareState.tags.map((tag) => (
                <Badge key={`${shareState.shareId}-${tag}`} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              워크플로우 구조 미리보기
            </h3>
            <WorkflowGraphPreview
              nodes={shareState.nodes}
              edges={shareState.edges}
            />
          </div>
        </div>
      </WorkflowShareSection>

      <WorkflowSharePurchaseDialog
        open={purchaseOpen}
        onOpenChange={handleDialogOpenChange}
        workflowTitle={shareState.workflowName}
        priceInCredits={shareState.priceInCredits}
        currentCredits={currentCredits}
        isCreditLoading={creditQuery.isLoading}
        onConfirm={handlePurchaseConfirm}
        isProcessing={isProcessingPurchase}
      />
    </div>
  );
}
