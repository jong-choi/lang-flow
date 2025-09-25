"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WorkflowSharePurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowTitle: string;
  priceInCredits: number;
  currentCredits?: number;
  isCreditLoading?: boolean;
  onConfirm: () => void;
  isProcessing?: boolean;
}

const formatNumber = (value: number | undefined) => {
  if (value === undefined) return "-";
  return value.toLocaleString();
};

export function WorkflowSharePurchaseDialog({
  open,
  onOpenChange,
  workflowTitle,
  priceInCredits,
  currentCredits,
  isCreditLoading = false,
  onConfirm,
  isProcessing = false,
}: WorkflowSharePurchaseDialogProps) {
  const safePrice = Math.max(0, priceInCredits);
  const enoughCredits = safePrice === 0 || (currentCredits ?? 0) >= safePrice;
  const showConfirmButton = !isCreditLoading && enoughCredits;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{workflowTitle}</DialogTitle>
          <DialogDescription>
            워크플로우 구매를 진행하려면 아래 정보를 확인하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isCreditLoading ? (
            <p className="text-sm text-muted-foreground">
              크레딧 정보를 불러오는 중입니다.
            </p>
          ) : enoughCredits ? (
            <p className="text-sm font-medium text-foreground">
              해당 워크플로우를 구매하시겠습니까?
            </p>
          ) : (
            <p className="text-sm font-medium text-red-600">
              보유한 크레딧이 부족합니다.
            </p>
          )}

          <div className="space-y-3 rounded-xl border bg-muted/40 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">현재 크레딧</span>
              <span className="font-medium">{`${formatNumber(currentCredits)}개`}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">차감 크레딧</span>
              <span className="font-medium">{`${formatNumber(safePrice)}개`}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            취소
          </Button>
          {showConfirmButton ? (
            <Button onClick={onConfirm} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> 구매 중...
                </>
              ) : (
                "구매"
              )}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
